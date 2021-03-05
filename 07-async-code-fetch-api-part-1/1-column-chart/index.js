import fetchJson from './utils/fetch-json.js';

export default class ColumnChart {
	chartHeight = 50;
	subElements = {};
	element;

  constructor({label = '', link = '', url='', range = {
      from: new Date(),
      to: new Date(),
    }, formatHeading = data => data} = {}) {

    this.label = label;
    this.link = link;
    this.range = range;
    this.formatHeading = formatHeading;
    this.url = `https://course-js.javascript.ru/${url}`

    this.render();
    this.loadData(this.range.from, this.range.to)
  }

	getChartColumns(data){
		const maxDataValue = Math.max(...Object.values(data));

		return Object.values(data).map( item => {
      const percent = Math.round((item / maxDataValue * 100));
      const value = Math.floor(item * (this.chartHeight / maxDataValue ));

      return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
		}).join('');
	}

	getSubElements(parentNode){
		const subElements = parentNode.querySelectorAll('[data-element]');

		subElements.forEach( node => {
			this.subElements[node.dataset.element] = node;
		})
	}

	getLayout(){
		return `
			<div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
	      <div class="column-chart__title">
	        Total ${this.label}
	        ${this.link && `<a href="${this.link}" class="column-chart__link">View all</a>`}
	      </div>
	      <div class="column-chart__container">
	        <div data-element="header" class="column-chart__header"></div>
	        <div data-element="body" class="column-chart__chart">

	        </div>
	      </div>
	    </div>
		`
	}

	render(){
		const element = document.createElement("div");

		element.innerHTML = this.getLayout();
		this.element = element.firstElementChild; 

		this.getSubElements(this.element);

		this.loadData(this.range.from, this.range.to)
	}

	async update(from, to){
		return await this.loadData(from, to)
	}

	async loadData(from, to){
		this.element.classList.add('column-chart_loading');

		this.subElements.header.textContent = '';
    this.subElements.body.innerHTML = '';

    this.range.from = from;
		this.range.to = to;

		const data = await fetchJson(`${this.url}?from=${from.toISOString()}&to=${to.toISOString()}`)

		if (data && Object.values(data).length) {
			this.subElements.body.innerHTML = this.getChartColumns(data);
			this.subElements.header.innerHTML = this.formatHeading(Object.values(data).reduce((sum, item) => (sum + item),0));

			this.element.classList.remove('column-chart_loading');
		}
		
	}

	destroy() {
    this.element.remove();
  }
}
