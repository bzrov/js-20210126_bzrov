export default class SortableTable {
	subElements	 = {};

	constructor(headerData = [], {data = [], sorted = {
      id: headerData.find(item => item.sortable).id,
      order: 'asc'
    }} = {}){
		this.data = data;
		this.headerData = headerData;
		this.sorted = sorted;

		this.element = null;
		this.render()
	}

	onHeaderClick = event => {
    const columnForSort = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => order === 'asc' ? 'desc' : 'asc';

    if (columnForSort) {
      const id = columnForSort.dataset.id;
      const order = columnForSort.dataset.order;

      const sortedData = this.sortData(id, toggleOrder(order));
      const sortArrow = columnForSort.querySelector('.sortable-table__sort-arrow');

      columnForSort.dataset.order = toggleOrder(order);

      if (!sortArrow) {
        columnForSort.append(this.subElements.arrow);
      }

      this.subElements.body.innerHTML = this.getTableBody(sortedData);
    }
  };

	getTableHeader(){
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

	getTableBody(data = []){
		return data.map((item)=> {
			return `<a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">${this.getTableBodyRow(item)}</a>`
		}).join('')
	}

	getTemplate(bodyData){
		return `
			<div data-element="productsContainer" class="products-list__container">
			  <div class="sortable-table">
			  	<div data-element="header" class="sortable-table__header sortable-table__row">
			    	${this.getTableHeader()}
			    </div>
			    <div data-element="body" class="sortable-table__body">
			  		${this.getTableBody(bodyData)}
			  	</div>
			  </div>
			</div>
		`
	}


	render(){
		const element = document.createElement("div");
		const {id, order} = this.sorted;
    const sortedData = this.sortData(id, order);

		element.innerHTML = this.getTemplate(sortedData);

		this.element = element.firstElementChild; 
		this.getSubElements(this.element)

		this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
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