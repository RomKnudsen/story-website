import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
	// variable: [
	// 	{
	// 		name: String,
	// 		value: String
	// 	}
	// ],
	frontPage:{
		title: {type: String},
		coverPhoto: {
			public_id: {type: String, required: true},
			url: {type: String, required: true}
		},
		defaultCharacter: [{
			name: String,
			image: {
				public_id: String,
				url: String
			}
		}],
		character: [
			[
				{
					name: String,
					image: {
						public_id: {type: String, required: true},
						url: {type: String, required: true}
					}
				}
			]
		]
	},
	pages: [
		{
			title: {type: String},
			coverPhoto: {
				public_id: {type: String},
				url: {type: String}
			},
			defaultCharacter: [{
				name: String,
				image: {
					public_id: String,
					url: String
				}
			}],
			character: [
				[
					{
						name: String,
						image: {
							public_id: {type: String, required: true},
							url: {type: String, required: true}
						}
					}
				]
			],
			storyText: {type: String, required: true},
		}
	],
	

},{timestamps: true});


export default mongoose.model('story', storySchema);