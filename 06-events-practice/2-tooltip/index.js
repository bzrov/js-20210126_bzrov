class Tooltip {
	static Instance;

	constructor(){
		if (Tooltip.Instance) {
      return Tooltip.Instance;
    }

    this.element = null;
    Tooltip.Instance = this;
	}

	onMouseIn = event => {
		const elementForTooltip = event.target.closest('[data-tooltip]');

    if (elementForTooltip) {
      this.render(elementForTooltip.dataset.tooltip);

      document.addEventListener('pointermove', this.moveTooltip);
    }
	}

	onMouseOut = () => {
    this.removeTooltip();
  };

	moveTooltip = event => {
    this.element.style.left = `${event.clientX + 15}px`;
    this.element.style.top = `${event.clientY + 15}px`;
  }

  removeTooltip = () => {
    if (this.element) this.remove()
  }

	render(value){
		const element = document.createElement('div');
		element.classList.add('tooltip')
    element.innerHTML = value

    this.element = element
    document.body.append(this.element)
	}

	initialize(){
		document.addEventListener('pointerover', this.onMouseIn);
	  document.addEventListener('pointerout', this.onMouseOut);
	}

	remove(){
		this.element.remove();
    this.element = null;
    document.removeEventListener('pointermove', this.moveTooltip);
	}

	destroy(){
		document.removeEventListener('pointerover', this.onMouseIn);
    document.removeEventListener('pointerout', this.onMouseOut);
    this.removeTooltip();
	}
}

const tooltip = new Tooltip();

export default tooltip;
