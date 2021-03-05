import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
	subElements	 = {};
	element;
	data = [];
	loadingData = false;
	sortLocal = false;

	constructor(headerData = [], {
		sorted = {
      id: headerData.find(item => item.sortable).id,
      order: 'asc'
    },
    url = '',
    step = 20,
    start = 1,
    end = start + step,
  	} = {}){

		this.headerData = headerData;
		this.sorted = sorted;
		this.url = new URL(url, BACKEND_URL);

		
		this.step = step;
    this.start = start;
    this.end = end;

		this.render()
	}

	onDocumentScroll = async () => {
    const bottom = this.element.getBoundingClientRect().bottom;
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loadingData && !this.sortLocal) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loadingData = true;

      const data = await this.getData(id, order, this.start, this.end);

      this.updateTableRows(data);

      this.loadingData = false;
    }
  };


	onHeaderClick = event => {
    const columnForSort = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => order === 'asc' ? 'desc' : 'asc';

    if (columnForSort) {
      const id = columnForSort.dataset.id;
      const newOrder = toggleOrder(columnForSort.dataset.order);

      const sortedData = this.sortData(id, newOrder);
      const sortArrow = columnForSort.querySelector('.sortable-table__sort-arrow');

      columnForSort.dataset.order = newOrder

      if (!sortArrow) {
        columnForSort.append(this.subElements.arrow);
      }

      if (this.sortLocal) {
        this.sortLocally(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder, 1, 1 + this.step);
      }
    }
  };

  getTableHeaderRow(){
  	const order = this.sorted.id === this.headerData.id ? this.sorted.order : 'asc';

		return this.headerData.map(({id, sortable, title}) => {
			return `
				<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
	        <span>${title}</span>
	        ${this.getHeaderSortingArrow(id)}
	      </div>
			`
		}).join('');
  }

	getTableHeader(){
		return `
			<div data-element="header" class="sortable-table__header sortable-table__row">
				${this.getTableHeaderRow()}
			</div>
		`
	}

	getHeaderSortingArrow (id) {
    const isOrder = this.sorted.id === id ? true : false;

    return isOrder
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }


	getTableBodyRow(data = []){
		const headerCells = this.headerData.map( ({id, template}) => {
			return {
				id,
				template
			}
		})

		return headerCells.map( ({id, template}) => {
			return template ? template(data[id]) : `<div class="sortable-table__cell">${data[id]}</div>`
		}).join('')
	}

	getTableBodyRows(data){
		return data.map((item)=> {
			return `<a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">${this.getTableBodyRow(item)}</a>`
		}).join('')
	}

	getTableBody(data = []){
		return `
			<div data-element="body" class="sortable-table__body">
				${this.getTableBodyRows(data)}
			</div>
		`
	}

	getTemplate(){
		return `
			<div data-element="productsContainer" class="products-list__container">
			  <div class="sortable-table">
			    	${this.getTableHeader()}
			  		${this.getTableBody(this.date)}

			  		<div data-element="loading" class="loading-line sortable-table__loading-line"></div>
		        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
		          No products
		        </div>
			  </div>
			</div>
		`
	}


	async render(){
		const element = document.createElement("div");
		const {id, order} = this.sorted;

		element.innerHTML = this.getTemplate();

		this.element = element.firstElementChild; 
		this.getSubElements(this.element)

		const data = await this.getData(id, order, this.start, this.end);

		this.renderTableBodyRows(data)

		this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
		document.addEventListener('scroll', this.onDocumentScroll);
	}

	async getData(id, order, start, end){
		this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table_loading');

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return data;
	}

	updateTableRows(data) {
    const tableBodyRows = document.createElement('div');

    this.data = [...this.data, ...data];
    tableBodyRows.innerHTML = this.getTableBodyRows(data);

    this.subElements.body.append(...tableBodyRows.childNodes);
  }

	sortLocally(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableBodyRows(sortedData);
  }

  async sortOnServer(id, order, start, end) {
    const data = await this.getData(id, order, start, end);

    this.renderTableBodyRows(data);
  }

	sortData(id, order) {
    const arr = [...this.data];
    const column = this.headerData.find(item => item.id === id);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], 'ru');
      case 'custom':
        return direction * customSorting(a, b);
      default:
        return direction * (a[id] - b[id]);
      }
    });
  }

  renderTableBodyRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.addTableBodyRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

 	addTableBodyRows(data){
      this.data = data;

    	this.subElements.body.innerHTML = this.getTableBodyRows(data);
 	}

	getSubElements(parentNode){
		const nodes = parentNode.querySelectorAll('[data-element]');

		nodes.forEach( node => {
			this.subElements[node.dataset.element] = node;
		})
	}

	remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}