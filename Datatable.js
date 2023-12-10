function DataTable(target, data, columns = {}, options = {}){

	target = target.querySelector('tbody') || target;

	let self = new DataTableBase([], columns, render);

	self.trElement = function(row, index){
		return document.createElement('tr');
	}

	self.tdElement = function(text){
		let target = document.createElement('td');
		target.innerHTML = text;
		return target;
	}

	function render(params){
		target.innerHTML = '';
		let _data = params?.items || self.items;
		let from = 0; to = 10;
		for(let i = from; i < to; i++){
			let row = _data[i];
			let data = row?.data;
			let tr = self.trElement(row, i);

			// init tdElements
			for(let i in data){
				let column = columns[i];
				if(!column || column.hidden) continue;
				let value = data[i];
				let tdModel = column.td || self.tdElement;
				let td = new tdModel(value);
				tr.append(td);
			}
			target.append(tr);
		}
	}

	function init(){
		self.update(data);
	}init();

	return self;

}