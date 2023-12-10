function DataTableBase(data, columns = {}, itemUpdateHandle = new Function){

	function fire(hook, data){
		if(typeof self[hook] == 'function')
			self[hook](data);
	}

	function DataItem(data){

		let self = {data: {}, update};

		function validate(data){
			for(let i in columns){
				data[i] = data[i] || '';
			}
			self.data = data;
		}

		function update(data, is_extend = 1){
			data = is_extend? {...self.data, ...data}: data;
			validate(data);
			fire('onItemUpdate', self);
			itemUpdateHandle();
		}

		function init(){
			validate(data);
		}init();

		return self;
	}

	let items = [];

	let self = {data, items, add, update, remove, clear, swap, sort, search};

	function getData(){

		let data = [];

		items.forEach(item=>{
			data.push(item.data);
		});

		return data;
	}

	function update(data, is_extend){

		fire('onBeforeUpdate', self);

		items = is_extend? items: [];

		for(let item in data){
			let value = data[item];
			let data_item = DataItem(value);
			items.push(data_item);
		};

		fire('onAfterUpdate', self);
		itemUpdateHandle(self);
	}

	function add(item_data, index = 0){
		let item = DataItem(item_data, index);
		items.splice(index, 0, item);
		fire('onAdd', {self, item, index});
		itemUpdateHandle(self);
	}

	function remove(id){
		let item = items[id];
		items.splice(id, 1)
		fire('onRemove', {self, item});
		itemUpdateHandle(self);
	}

	function clear(){
		items = [];
		fire('onClear', self);
		itemUpdateHandle(self);
	}

	function swap(id, id_2){
		let from = items[id];
		let to = items[id_2];
		items[id] = to;
		items[id_2] = from;
		fire('onSwap', {self, from, to});
		itemUpdateHandle(self);
	}

	function sort(hook, type){
		if(!type)
			self.items.sort(function(a, b){
				a = a.data[hook];
				b = b.data[hook];
				return a.localeCompare? a.localeCompare(b) : a - b;
			});
		else
			self.items.sort(function(a, b){
				a = a.data[hook];
				b = b.data[hook];
				return b.localeCompare? b.localeCompare(a) : b - a;
			});
		fire('onSort', self);
		itemUpdateHandle(self);
	}

	function search(string){
		let data = self.items.filter((data, index) => {
			let text = '';
			for(let j in columns){
				if(columns[j].searchable)
					text += data.data[j] + ',';
			}

			return text.includes(string)? data: '';
		});
		fire('onSearch', {self, items: data});
		itemUpdateHandle({items: data});
	}

	function init(){

		Object.defineProperties(self, {
			items: {get: function(){ return items; }},
			data: {get: function(){ return getData(); }},
		});

	}init();

	return self;

}