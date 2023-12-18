function MakePagination(page = 1, pages = 10, size = 3){

	page = (page < 1)? 1 : (page > pages)? pages: page;

	let mid = Math.floor(size/2);
	let start = (page - mid) <= 0? 1
		: (page + size) > pages? (pages - size + 1)
		: (page - mid);
	let end = start + size;

	let head = start > 1? [1, null]: [];
	let data = []
	let foot = end < pages? [null, pages]: [];

	for(let i = start; i < end; i++){
		data.push(i);
	}

	data = head.concat(data, foot);

	return {page, pages, size, data};

}

function Pagination(options = {}, updateHandle = new Function){

	let {page, pages, size} = options || {}; 
	let self = {data: []};

	function update(){
		options = MakePagination(page, pages, size);
		updateHandle(self);
	}

	function setProp(key, value){
		options[key] = value;
		update();
	}

	function init(){

		update();

		for(let k in options){
			Object.defineProperty(self, k, {
				get: function(){ return options[k]; },
				set: function(value){ setProp(k, value); }
			});
		}

		Object.defineProperty(self, 'data', {
			get: function(){ return options['data']; },
		});


	}init();

	return self;

}

function PaginationElement(options = {}, updateHandle = new Function){

	let self = new Pagination(options, update);

	function update(e){
		let {page, data} = e;
		updateHandle(data);
		console.log(e);
		e.page = 10
	}

	return self;

}

let page = new PaginationElement;