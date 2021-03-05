export default class SortableTable {
	subElements	 = {};

	constructor(headerData = [], {data = []} = {}){
		this.data = data;
		this.headerData = headerData;

		this.render()
	}

	getTableHeader(){
		return this.headerData.map( ({id, sortable, title}) => {
			return `
				<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
	        <span>${title}</span>
	        <span data-element="arrow" class="sortable-table__sort-arrow">
	          <span class="sort-arrow"></span>
	        </span>
	      </div>
			`
		}).join('');

	}

	getTableBodyRow(data){
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

	getTableBody(data = this.data){
		return data.map((item)=> {
			return `<a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">${this.getTableBodyRow(item)}</a>`
		}).join('')
	}

	get template(){
		return `
			<div data-element="productsContainer" class="products-list__container">
			  <div class="sortable-table">
			  	<div data-element="header" class="sortable-table__header sortable-table__row">
			    	${this.getTableHeader()}
			    </div>
			    <div data-element="body" class="sortable-table__body">
			  		${this.getTableBody()}
			  	</div>
			  </div>
			</div>
		`
	}

	render(){
		const element = document.createElement("div");

		element.innerHTML = this.template;

		this.element = element.firstElementChild; 
		this.getSubElements(this.element)
	}

	sort(field, order) {
    const sortedData = this.sortData(field, order);

    this.update(this.getTableBody(sortedData), 'body')
  }

  sortData(field, order) {
    const sortingColumn = this.headerData.find( ({id}) => id === field);
    const {sortType} = sortingColumn;
    const direction = order === 'asc' ? 1 : -1;

    return this.data.slice().sort((a, b) => {
      switch (sortType) {
      case 'string':
        return direction * a[field].localeCompare(b[field], 'ru');
      case 'number':
        return direction * (a[field] - b[field]);
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }

	getSubElements(parentNode){
		const nodes = parentNode.querySelectorAll('[data-element]');

		nodes.forEach( node => {
			this.subElements[node.dataset.element] = node;
		})
	}

	update(template, node){
		this.subElements[node].innerHTML = template
	}

	remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

