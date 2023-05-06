
class Filter {
	constructor(data, query){
		this.data = data;
		this.query = query;
	}

	search(){
		const keyword = this.query ? {
			title: {
				$regex: this.query,
				$options: 'i'
			}
		}: {};

		this.data = this.data.find({...keyword}).sort({createdAt: -1});

		return this.data;
	}
}

export default Filter;