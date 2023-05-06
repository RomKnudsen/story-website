import catchAsyncError from '../middlewares/catchAsyncError.js';
import AddCharacterTextModel from '../models/AddCustomizeText.js'; 
import sendResponse from '../utils/sendResponse.js';
import cloudinary from 'cloudinary';
import globalVariableModel from '../models/globalVariable.js';
import HomeTextModel from '../models/HomeText.js';
import {wooCommerce} from '../utils/woocommerce.js';
import UserModel from '../models/user.js';


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


export const addCharacterText = catchAsyncError(async (req, res) => {
	const {title, para} = req.body;

	if(!title || !para){
		return sendResponse(false, 401, 'All fields are required', res);
	}

	const text  = await AddCharacterTextModel.findOne();
	if(text){
		text.title = title;
		text.para = para;
		await text.save();
	}else{
		await AddCharacterTextModel.create(req.body);
	}

	sendResponse(true, 201, 'Update successfully', res);
});

export const addHomeText = catchAsyncError(async (req, res) => {
	const {title, para} = req.body;

	if(!title || !para){
		return sendResponse(false, 401, 'All fields are required', res);
	}

	const text  = await HomeTextModel.findOne();
	if(text){
		text.title = title;
		text.para = para;
		await text.save();
	}else{
		await HomeTextModel.create(req.body);
	}

	sendResponse(true, 201, 'Update successfully', res);
});

export const getCharacterText = catchAsyncError(async (req, res) => {
	const text  = await AddCharacterTextModel.findOne();

	res.status(200).json({
		success: true,
		text: text
	})
});

export const getHomeText = catchAsyncError(async (req, res) => {
	const text  = await HomeTextModel.findOne();

	res.status(200).json({
		success: true,
		text: text
	})
});


export const deleteVariable = catchAsyncError(async (req, res) => {
	const id = req.params.id;
	const variable = globalVariableModel.findById(id);
	if(!variable) return sendResponse(false, 404, 'Invalid id', res);
	await variable.remove();
	sendResponse(true, 201, 'delete successfully', res);
});


export const getHomePageCharacter = catchAsyncError(async (req, res) => {
	wooCommerce.get('products?per_page=100', async function(err, data, response) {
		const Woodata = JSON.parse(response);
		const characterSet = new Set();
		Woodata.forEach((data) => {
			if(data['categories'][0].name.toLowerCase() == 'bamser'){
				characterSet.add(data.name)
			}
		});
		const characterName = [...characterSet];

		let Maincharacters = await HomeTextModel.findOne();
		let characters = Maincharacters.characters;

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
			charactersWithImage: Woocharacter,
			coverPhoto: Maincharacters.coverPhoto
		})
	})
});


export const addHomePageCharacterImage = catchAsyncError(async (req, res) => {
	const {characterLists, coverPhoto} = req.body;
	let Maincharacters = await HomeTextModel.findOne();
	if(typeof coverPhoto === 'string'){
		if(Maincharacters?.coverPhoto?.public_id){
			await cloudinary.uploader.destroy(Maincharacters?.coverPhoto?.public_id);
		}
		const result = await cloudinary.uploader.upload(coverPhoto,{
			folder: 'characters'
		});

		Maincharacters.coverPhoto = {
			public_id: result.public_id,
			url: result.secure_url
		}

		await Maincharacters.save();
	}

	let characters = Maincharacters.characters || []

	for(let i=0; i<characterLists.length; i++){
		const isAdd = characters.find((data) => data.name === characterLists[i].name);

		if(isAdd && typeof characterLists[i].image == 'string'){
			const index = characters.indexOf(isAdd);
			// const currentCharacter = characters[index];
			// const characterById = await characterModel.findById(currentCharacter._id);
			await cloudinary.uploader.destroy(characters[index].image.public_id);
			const result = await cloudinary.uploader.upload(characterLists[i].image,{
				folder: 'characters'
			});
			Maincharacters.characters[index].image = {
				public_id: result.public_id,
				url: result.secure_url
			}
			await Maincharacters.save();
		}else if(characterLists[i].image !== '' && typeof characterLists[i].image == 'string'){	
			const result = await cloudinary.uploader.upload(characterLists[i].image,{
				folder: 'characters'
			});

			const image = {
				public_id: result.public_id,
				url: result.secure_url
			}
			const charaterData = {name: characterLists[i].name, image}
			await Maincharacters.characters.push(charaterData);
			await Maincharacters.save();
		}
	}
	
	sendResponse(true, 201, 'Character add successfully', res);
});


export const getHomeImageForUser = catchAsyncError(async (req, res) => {
	let Maincharacters = await HomeTextModel.findOne();
	const user = await UserModel.findById(req.user._id);

	const character = JSON.parse(JSON.stringify(user.character));

	character.forEach(({name},i) => {
		const find = Maincharacters.characters.find((data) => name.toLowerCase() === data.name.toLowerCase());
		character[i].image = find.image;
	});

	res.status(200).json({
		success: true,
		coverPhoto: Maincharacters.coverPhoto,
		character
	});
});