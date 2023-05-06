import catchAsyncError from '../middlewares/catchAsyncError.js';
import StoryModel from '../models/story.js'; 
import sendResponse from '../utils/sendResponse.js';
import Filter from '../utils/filter.js';
import globalVariableModel from '../models/globalVariable.js';
import textToPage from '../utils/textToPage.js';
import cloudinary from 'cloudinary';


export const getStory = catchAsyncError(async (req, res) => {
	const story = new Filter(StoryModel.find(), req.query.query).search();
	const stories = await story;
	res.status(200).json({
		success: true,
		stories
	});
});

export const getSinglePage = catchAsyncError(async (req, res) => {
	const id = req.params.id;
	const page = Number(req.params.page)-1;

	let story = await StoryModel.findById(id);
	if(!story){
		return sendResponse(false, 404, 'Invalid id', res);
	}

	if(story.pages.length < page+1){
		return sendResponse(false, 404, 'page length out of range', res);
	}

	if(page == -1){
		res.status(200).json({
			success: true,
			page: story.frontPage
		})
	}else{
		res.status(200).json({
			success: true,
			page: story.pages[page]
		})
	}
});

export const updateStory = catchAsyncError(async (req, res) => {
	const id = req.params.id;

	const page = Number(req.params.page)-1;
	let story = await StoryModel.findById(id);
	const {title, character, defaultCharacter, coverPhoto, storyText} = req.body;
	if(!story){
		return sendResponse(false, 404, 'Invalid id', res);
	}
	console.log(id)
	console.log(character);

	if(story.pages.length < page+1){
		return sendResponse(false, 404, 'page length out of range', res);
	}

	// update frontPage
	if(page == -1){
		story.frontPage.title = title;
		// update cover photo
		if(typeof coverPhoto == 'string'){
			await cloudinary.uploader.destroy(story.frontPage.coverPhoto.public_id);

			const result = await cloudinary.uploader.upload(coverPhoto);
			story.frontPage.coverPhoto = {
				public_id: result.public_id,
				url: result.secure_url
			}
		}

		// update character
		for(let i=0; i<character.length; i++){
			for(let j=0; j<character[i].length; j++){
				if(typeof character[i][j].image == 'string'){
					await cloudinary.uploader.destroy(story.frontPage.character[i][j].image.public_id);
					const result = await cloudinary.uploader.upload(character[i][j].image);
					story.frontPage.character[i][j].image = {
						public_id: result.public_id,
						url: result.secure_url
					}
				}
			}
		}

		// update defaultCharacter
		for(let i=0; i<defaultCharacter.length; i++){
			if(typeof defaultCharacter[i].image == 'string'){
				await cloudinary.uploader.destroy(story.frontPage.defaultCharacter[i].image.public_id);
				const result = await cloudinary.uploader.upload(defaultCharacter[i].image);
				story.frontPage.defaultCharacter[i].image = {
					public_id: result.public_id,
					url: result.secure_url
				}
			}
		}
	}else{
		story.pages[page].storyText = storyText;
		// update cover photo
		if(typeof coverPhoto == 'string'){
			await cloudinary.uploader.destroy(story.pages[page].coverPhoto.public_id);

			const result = await cloudinary.uploader.upload(coverPhoto);
			story.pages[page].coverPhoto = {
				public_id: result.public_id,
				url: result.secure_url
			}
		}

		// update character
		for(let i=0; i<character.length; i++){
			for(let j=0; j<character[i].length; j++){
				if(typeof character[i][j].image == 'string'){
					await cloudinary.uploader.destroy(story.pages[page].character[i][j].image.public_id);
					const result = await cloudinary.uploader.upload(character[i][j].image);
					story.pages[page].character[i][j].image = {
						public_id: result.public_id,
						url: result.secure_url
					}
				}
			}
		}

		// update defaultCharacter
		for(let i=0; i<defaultCharacter.length; i++){
			if(typeof defaultCharacter[i].image == 'string'){
				await cloudinary.uploader.destroy(story.pages[page].defaultCharacter[i].image.public_id);
				const result = await cloudinary.uploader.upload(defaultCharacter[i].image);
				story.pages[page].defaultCharacter[i].image = {
					public_id: result.public_id,
					url: result.secure_url
				}
			}
		}
	}

	await story.save();

	return sendResponse(true, 200, 'Story update successfully', res);
});



export const deleteStory = catchAsyncError(async (req, res) => {
	const id = req.params.id;
	const story = await StoryModel.findById(id);

	if(!story){
		return sendResponse(false, 404, 'Invalid id', res);
	}

	// delete frontPage image
	await cloudinary.uploader.destroy(story.frontPage.coverPhoto.public_id);
	for(let i=0; i<story.frontPage.defaultCharacter.length; i++){
		await cloudinary.uploader.destroy(story.frontPage.defaultCharacter[i].image.public_id);
	}
	for(let i=0; i<story.frontPage.character.length; i++){
		for(let j=0; j<story.frontPage.character[i].length; j++){
			await cloudinary.uploader.destroy(story.frontPage.character[i][j].image.public_id);
		}
	}

	// delete page image
	for(let i=0; i<story.pages.length; i++){
		await cloudinary.uploader.destroy(story.pages[i].coverPhoto.public_id);
		for(let l=0; l<story.pages[i].defaultCharacter.length; l++){
			await cloudinary.uploader.destroy(story.pages[i].defaultCharacter[l].image.public_id);
		}

		for(let j=0; j<story.pages[i].character.length; j++){
			for(let k=0; k<story.pages[i].character[j].length; k++){
				await cloudinary.uploader.destroy(story.pages[i].character[j][k].image.public_id);
			}
		}
	}


	await story.remove();

	return sendResponse(true, 200, 'Story delete successfully', res);
});


export const detailsStory = catchAsyncError(async (req, res) => {
	const id = req.params.id;
	const story = await StoryModel.findById(id);
	
	if(!story){
		return sendResponse(false, 404, 'Invalid id', res);
	}
	// const pages = await textToPage(story.storyText, 100);

	// const newStory = {
	// 	pages,
	// 	title: story.title,
	// 	coverPhoto: story.coverPhoto.url
	// }
	// const replaceAll = (str, search, replace) => {
	// 	return str.split(search).join(replace);
	// }

	// for(let i=0; i< story.variable.length; i++){
	// 	const search = '['+story.variable[i].name.trim()+']';
	// 	story.storyText = replaceAll(story.storyText, search, story.variable[i].value);
	// }


	res.status(200).json({
		success: true,
		story
	})
});


// create story
export const crateStory = catchAsyncError(async (req, res) => {
	const {title, character, coverPhoto, variable, defaultCharacter} = req.body;
	console.log(variable);
	if(!title || !coverPhoto || !character || !variable){
		return sendResponse(false, 401, 'All fields are required', res);
	}

	// image upload 
	const result = await cloudinary.uploader.upload(req.body.coverPhoto,{
		folder: 'story cover photo'
	});

	req.body.coverPhoto = {
		public_id: result.public_id,
		url: result.secure_url
	}

	const uploadImage = [];
	for(let i=0; i< character.length; i++){
		const uploadedArr = [];
		for(let j=0; j< character[i].length; j++){
			const result = await cloudinary.uploader.upload(character[i][j].image,{
				folder: 'story cover photo'
			});

			uploadedArr.push({
				name: character[i][j].name,
				image: {
					public_id: result.public_id,
					url: result.secure_url
				}
			});
		}

		uploadImage.push(uploadedArr);
	}

	const defaultCharacterUpload = [];
	for(let i=0; i< defaultCharacter.length; i++){
		const result = await cloudinary.uploader.upload(defaultCharacter[i].image,{
			folder: 'story cover photo'
		});

		defaultCharacterUpload.push({
			name: defaultCharacter[i].name,
			image: {
				public_id: result.public_id,
				url: result.secure_url
			}
		});
	}

	for(let i=0; i<variable.length; i++){
		if(variable[i].name){
			await globalVariableModel.create(variable[i]);
		}
	}

	req.body.character = uploadImage;
	req.body.defaultCharacter = defaultCharacterUpload;
	delete req.body.variable
	const story = await StoryModel.create({frontPage: req.body});

	res.status(200).json({
		success: true,
		id: story._id,
		message: "Front page add successfully"
	});
});


export const addPage = catchAsyncError(async (req, res) => {
	const {character, coverPhoto, storyText, defaultCharacter} = req.body;

	const id = req.params.id;
	const story = await StoryModel.findById(id);

	if(!story){
		return sendResponse(false, 404, 'Invalid story Id', res);
	}

	if(!coverPhoto || !storyText || !character){
		return sendResponse(false, 401, 'All fields are required', res);
	}

	// image upload pending 
	const result = await cloudinary.uploader.upload(req.body.coverPhoto,{
		folder: 'story cover photo'
	});

	req.body.coverPhoto = {
		public_id: result.public_id,
		url: result.secure_url
	}

	const uploadImage = [];
	for(let i=0; i< character.length; i++){
		const uploadedArr = [];
		for(let j=0; j< character[i].length; j++){
			const result = await cloudinary.uploader.upload(character[i][j].image,{
				folder: 'story cover photo'
			});

			uploadedArr.push({
				name: character[i][j].name,
				image: {
					public_id: result.public_id,
					url: result.secure_url
				}
			});
		}

		uploadImage.push(uploadedArr);
	}

	const defaultCharacterUpload = [];
	for(let i=0; i< defaultCharacter.length; i++){
		const result = await cloudinary.uploader.upload(defaultCharacter[i].image,{
			folder: 'story cover photo'
		});

		defaultCharacterUpload.push({
			name: defaultCharacter[i].name,
			image: {
				public_id: result.public_id,
				url: result.secure_url
			}
		});
	}

	req.body.character = uploadImage;
	req.body.defaultCharacter = defaultCharacterUpload;
	story.pages.push(req.body);

	await story.save();
	sendResponse(true, 201, 'Page add successfully', res);
});


export const getVariable = catchAsyncError(async (req, res) => {
	const variable = await globalVariableModel.find();

	res.status(200).json({
		success: true,
		variable
	});
});