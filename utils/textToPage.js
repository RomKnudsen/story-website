
export default async function textToPage (text, wordPerPage){
	const words = text.split(' ');

	const wordCount = words.length/wordPerPage;

	const pages = [];

	for(let i=0; i<wordCount; i++){
		const array = words.slice(i*wordPerPage, (i+1)*wordPerPage);
		pages.push(array.join(" "));
	}
	return pages;
}