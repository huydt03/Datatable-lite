function DataTableHeader(target){
	let thead = target.querySelector('thead');
	let ths = thead.querySelectorAll('th');

	let columns = {};
	let j = 0;
	for(let i in ths){
		let th = ths[i];
		if(!th.getAttribute) continue;
		let key = th.getAttribute('name') || j++;
		let sortable = th.hasAttribute('sortable');
		let searchable = th.hasAttribute('searchable');
		let hidden = th.hasAttribute('hidden');
		columns[key] = {
			sortable,
			searchable,
			hidden,
			target: th
		}
	}

	return columns;
}

function TablePageination(target){
	let tfoot = target.querySelector('tfoot') || target;
	let _target = tfoot.querySelector('.pagination');
	let _item = tfoot.querySelector('.page-item');
	let next = tfoot.querySelector('.page-next');
	let prev = tfoot.querySelector('.page-prev');
	let prev_dots = document.createElement('label');
	let next_dots = document.createElement('label');

	next_dots.innerHTML = prev_dots.innerHTML = '...';

	function item(index){
		let item = _item.cloneNode();
		item.innerHTML = index;
		return item;
	}

	return {
		tfoot, target: _target, item, next, prev, next_dots, prev_dots
	}
}

function DataTable(target, data, columns = {}, pagination){

	let body = target.querySelector('tbody') || target;

	let n_page = 1;

	let n_row = 10;

	let n_page_items = 3;
	
	let n_page_items2 = Math.floor((n_page_items)/2);

	let data_length = 0;

	let self = new DataTableBase([], columns, renderBody);

	self.trElement = function(row, index){
		return document.createElement('tr');
	}

	self.tdElement = function(value){
		let target = document.createElement('td');
		target.innerHTML = value;
		return target;
	}

	self.sortElement = function(column){
		let target = document.createElement('div');
		target.classList.add('data-sort');
		target.innerHTML = '<label>&uarr;</label><label>&darr;</label>';
		return target;
	}

	self.paginationElement = function(){
		let target = document.createElement('div');

		let item = function(index){
			let target = document.createElement('label');
			target.innerHTML = index;
			return target;
		}

		return {
			target, item, 
			next: item('>'), prev: item('<'),
			next_dots: item('...'), prev_dots: item('...')
		};
	}

	function sortHandle(column, target_sort, key){
		let desc = false;
		target_sort.setAttribute('desc', desc);
		column.onclick = function(e){
			desc = !desc;
			target_sort.setAttribute('desc', desc);
			self.sort(key, desc)
		}
	}

	function paginationHandle(item, index){
		if(index == n_page)
			item.classList.add('active');
		item.onclick = function(){
			self.n_page = index;
		}
	}

	function renderPaginationItems(){
		let {target, item, next_dots, prev_dots} = pagination;
		target.innerHTML = '';
		let prev_item = item(1);
		paginationHandle(prev_item, 1);
		target.append(prev_item);
		target.append(prev_dots);
		let length = Math.round(data_length/n_row);
		let n_pages = [];
		for(let i = 0; i < n_page_items; i++){
			n_pages.push(i + n_page - n_page_items2);
		}
		for(let i in n_pages){
			let index = n_pages[i];
			if(index < 1){
				prev_item.remove();
				prev_dots.remove();
				continue;
			}
			if(index > length){
				continue;
			}
			let target_item = item(index);
			target.append(target_item);
			paginationHandle(target_item, index);
		}

		if(n_pages[n_pages.length - 1] < length){
			target.append(next_dots);
			let next_item = item(length);
			target.append(next_item);
			paginationHandle(next_item, length);
		}
	}

	function renderPagination(){
		pagination = pagination || self.paginationElement();
		
		let {tfoot, target: _target, item, next, prev} = pagination;

		tfoot = tfoot || target.querySelector('tfoot');

		if(!tfoot)
			return;

		if(!_target.offsetParent)
			tfoot.append(_target);
		
		let container = document.createElement('div');
		container.classList.add('pagination');

		_target.replaceWith(container);

		function tfootAdd(items){
			items.forEach(item=>{
				if(!item.parent)
					container.append(item);
			})
		}

		tfootAdd([prev, _target, next]);

		next.onclick = e=> { self.n_page = n_page + 1; };
		prev.onclick = e=> { self.n_page = n_page - 1; };

		renderPaginationItems();

	}

	function renderSort(){
		for(let i in columns){
			let column = columns[i];
			let target = column.target || {};
			if(!column.sortable || !target.append) continue;
			let target_sort = self.sortElement(target, i);
			target.append(target_sort);
			sortHandle(target, target_sort, i);
		}
	}

	function renderBody(params){
		body.innerHTML = '';
		let _data = params?.items || self.items;
		data_length = _data.length;
		let from = (n_page - 1) * n_row; 
		let to = from + n_row;
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
			body.append(tr);
		}
	}

	function initTable(){
		self.update(data);
		renderPagination();
	}

	function init(){

		initTable();
		renderSort();

		Object.defineProperties(self, {
			n_page: {
				get: function(){ return n_page; },
				set: value=> {

					if(value <= 0 || Math.round(data_length/n_row) < value)
						return;

					n_page = value;
					self.update(data);
					renderPaginationItems();
				}
			},
			n_row: {
				set: value=> {
					n_row = value;
					initTable();
				}
			}
		})
	}init();

	return self;

}