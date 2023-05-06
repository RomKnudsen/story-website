import catchAsyncError from '../middlewares/catchAsyncError.js';
import characterModel from '../models/character.js'; 
import sendResponse from '../utils/sendResponse.js';
import cloudinary from 'cloudinary';
import {wooCommerce} from '../utils/woocommerce.js';
import StoryModel from '../models/story.js';
import UserModel from '../models/user.js';
import variableModel from '../models/globalVariable.js';

const findWord = (name) => {
	name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
	const list = ['troje','bukser','sko','vanter','harband','briller','kjole','hat','tilbehor'];
	let Clothname = 'exmaple';
	for(let i=0; i<list.length; i++){
		if(name.includes(list[i])){
			const index = name.indexOf(list[i]);
			Clothname = name.slice(index,index+index-1);
			break;
		}
	}

	return Clothname;
}

const sorted = {
	troje: 1,
	bukser: 2,
	sko: 3,
	vanter: 4,
	harband: 5,
	briller: 6,
	kjole: 7,
	hat: 8,
	tilbehor: 9,
}

const shortbyName = (data) => {
	data.sort((a, b) => {
		const aName = findWord(a.name);
		  // let aName = a.name.split(" ")[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
		const aIndex = sorted[aName];
		    
		  // let bName = b.name.split(" ")[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
		const bName = findWord(b.name);
		const bIndex = sorted[bName];
		return aIndex - bIndex;
	});
	return data;
}

const seprateFuncByCharacter = (arr, characterName) => {
		const seprate = [];
		characterName.forEach((name) => {
			let image = null;
			let active = null;
			let characterPronoun = null;
			let characterName = null;
			let variable = null;
			let gender = null;
		  let filter = arr.filter((data) => {
		    if(data.name.toLowerCase() === name.toLowerCase()){
		      image = data.image;
		      active = data.active;
		      characterName = data.characterName;
		      characterPronoun = data.characterPronoun;
		      variable = data.variable;
		      gender = data.gender;
		      return false;
		    }
		    return data.name.includes(name);
		  });

		  if(image){
		  	filter.unshift({name,image,active, characterName, characterPronoun, variable, gender});
		  }

		  if(filter.length !== 0){
		  	filter = shortbyName(filter)
			seprate.push(filter);
		  }
		})

		return seprate;
}

const seprateFuncByCharacter2 = (arr, characterName) => {
		const seprate = [];
		characterName.forEach((name) => {
			let image = null;
			let active = null;
			let characterPronoun = null;
			let characterName = null;
		  let filter = arr.filter((data) => {
		    if(data.name.toLowerCase() === name.toLowerCase()){
		      image = data.image;
		      active = data.active;
		      characterName = data.characterName;
		      characterPronoun = data.characterPronoun;
		      return false;
		    }
		    return data.name.includes(name);
		  });

		  if(image !== undefined){
		  	filter.unshift({name,image,active, characterName, characterPronoun});
		  }

		  if(filter.length !== 0){
		  	filter = shortbyName(filter)
			seprate.push(filter);
		  }
		})

		return seprate;
}

export const addCharacterImage = catchAsyncError(async (req, res) => {
	const {characterLists} = req.body;
	const characters = await characterModel.find();

	for(let i=0; i<characterLists.length; i++){
		const isAdd = characters.find((data) => data.name === characterLists[i].name);

		if(isAdd && typeof characterLists[i].image == 'string'){
			const index = characters.indexOf(isAdd);
			const currentCharacter = characters[index];
			const characterById = await characterModel.findById(currentCharacter._id);
			await cloudinary.uploader.destroy(currentCharacter.image.public_id);
			const result = await cloudinary.uploader.upload(characterLists[i].image,{
				folder: 'characters'
			});
			characterById.image = {
				public_id: result.public_id,
				url: result.secure_url
			}
			await characterById.save();
		}else if(characterLists[i].image !== '' && typeof characterLists[i].image == 'string'){	
			const result = await cloudinary.uploader.upload(characterLists[i].image,{
				folder: 'characters'
			});

			const image = {
				public_id: result.public_id,
				url: result.secure_url
			}
			const charaterData = {name: characterLists[i].name, image}
			await characterModel.create(charaterData);
		}
	}
	
	sendResponse(true, 201, 'Character add successfully', res);
});


export const getCharacterImage = catchAsyncError(async (req, res) => {
	wooCommerce.get('products?per_page=100', async function(err, data, response) {
		const Woodata = JSON.parse(response);
		const characterSet = new Set();
		Woodata.forEach((data) => {
			if(data['categories'][0].name.toLowerCase() == 'bamser'){
				characterSet.add(data.name)
			}
		});
		const characterName = [...characterSet];

		const characters = await characterModel.find();

		let Woocharacter = [];

		for(let i=0; i < Woodata.length; i++){
			Woocharacter.push({name: Woodata[i].name, image: ''});
		}
		Woocharacter = seprateFuncByCharacter2(Woocharacter, characterName);
		let temp = [];
		for(let i=0; i<Woocharacter.length; i++){
			temp = [...temp,...Woocharacter[i]]
		}
		Woocharacter = temp;

		for(let i=0;i<characters.length; i++){
			const isAdd = Woocharacter.find((data) => characters[i].name == data.name);
			// console.log(isAdd);
			if(isAdd){
				const index = Woocharacter.indexOf(isAdd);
				Woocharacter[index] = characters[i];
			}
		}

		// add defaultCharacter
		const defaultBoy = characters.find((data) => data.name.toLowerCase() == 'boy');
		const defaultGirl = characters.find((data) => data.name.toLowerCase() == 'girl');
		if(defaultBoy){
			Woocharacter.unshift(defaultBoy);
		}else{
			Woocharacter.unshift({name: 'boy',image: ''});
		}

		if(defaultGirl){
			Woocharacter.unshift(defaultGirl);
		}else{
			Woocharacter.unshift({name: 'girl',image: ''});
		}
		res.status(200).json({
			success: true,
			charactersWithImage: Woocharacter
		})
	})
});

export const getCharacter = catchAsyncError(async (req, res) => {
	wooCommerce.get('products?per_page=100', function(err, data, response) {
		if(err){
			return sendResponse(false, 501, err.message, res);
		}

		data = JSON.parse(response);
		console.log(data.length);
		let character = [];

		for(let i=0; i < data.length; i++){
			character.push({name: data[i].name, image: '', tags: data[i]['categories'][0]?.name});
		}

		const sorted = {
		  troje: 1,
		  bukser: 2,
		  sko: 3,
		  vanter: 4,
		  harband: 5,
		  briller: 6,
		  kjole: 7,
		  hat: 8,
		  tilbehor: 9,
		}

		const shortbyName = (data) => {
		  data.sort((a, b) => {
		  	const aName = findWord(a.name);
		  // let aName = a.name.split(" ")[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
		    const aIndex = sorted[aName];
		    
		  // let bName = b.name.split(" ")[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
		    const bName = findWord(b.name);
		    const bIndex = sorted[bName];
		    return aIndex - bIndex;
		  });
		  return data;
		}

		const characterSet = new Set();
		character.forEach(({tags,name}) => {
			if(tags.toLowerCase() == 'bamser'){
				characterSet.add(name)
			}
		})
		const characterName = [...characterSet];
		const seprate = [];
		characterName.forEach((name) => {
		  let filter = character.filter((data) => {
		    if(data.name.toLowerCase() === name.toLowerCase()){
		      return false;
		    }
		    return data.name.includes(name);
		  });
		  
		  filter = shortbyName(filter)
		  filter.unshift({name,image: ''})
		  seprate.push(filter);
		})

	 	res.status(200).json({
			success: true,
			character: seprate
		});
	});
	
});

export const getAvaibleAndLockedCharacter = catchAsyncError(async (req, res) => {
	wooCommerce.get('products?per_page=100', async function(err, data, response) {
		const productData = JSON.parse(response);
		const characterSet = new Set();
		productData.forEach((data) => {
			if(data['categories'][0].name.toLowerCase() == 'bamser'){
				characterSet.add(data.name)
			}
		});
		const characterName = [...characterSet];

		let story = await StoryModel.findOne();
		const user = await UserModel.findById(req.user._id);
		let unlockedCharcter = JSON.parse(JSON.stringify(user.unlockCharacter));

		// let tempCharcter = [];
		// for(let i=0; i<story?.frontPage?.character?.length; i++){
		// 	const characterArr = story?.frontPage?.character[i]
		// 	tempCharcter = [...tempCharcter,...characterArr];
		// }
		let tempCharcter = await characterModel.find();
		// console.log(tempCharcter)

		for(let i=0; i<unlockedCharcter.length; i++){
			const find = tempCharcter.find(({name}) => name.toLowerCase() == unlockedCharcter[i].name.toLowerCase());
			if(find){
				unlockedCharcter[i].image = find.image;
			}
			// if(unlockedCharcter[i].name == 'boy'){
			// 	unlockedCharcter[i].image = story.frontPage.defaultCharacter[0].image;
			// }
			// if(unlockedCharcter[i].name == 'girl'){
			// 	unlockedCharcter[i].image = story.frontPage.defaultCharacter[1].image;
			// }
		}
		// delete unlocl character
		for(let i=0; i<tempCharcter.length; i++){
			const isUnlock = unlockedCharcter.some(({name}) => name.toLowerCase() == tempCharcter[i].name.toLowerCase());
			// console.log(tempCharcter[i].name, isUnlock)
			if(isUnlock){
				tempCharcter.splice(i,1);
			}
		}
		const boy = tempCharcter.find((data) => data.name == 'boy');
		if(boy) tempCharcter.splice(tempCharcter.indexOf(boy),1);
		const girl = tempCharcter.find((data) => data.name == 'girl');
		if(girl) tempCharcter.splice(tempCharcter.indexOf(girl),1);

		// console.log(tempCharcter);

		characterName.push('boy');
		characterName.push('girl');
		unlockedCharcter = seprateFuncByCharacter(unlockedCharcter, characterName);
		// unlockedCharcter = [[story?.frontPage?.defaultCharacter[0]],[story?.frontPage?.defaultCharacter[1]], ...unlockedCharcter];

		tempCharcter = seprateFuncByCharacter(tempCharcter, characterName);
		const globalVariable = await variableModel.find();
		
		res.status(200).json({
			success: true,
			unlockedCharcter,
			lockedCharcter: tempCharcter,
			globalVariable
		});
	})
});

