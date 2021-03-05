export default class NotificationMessage {
	static element;

	constructor(message = '', {duration = 1000, type = 'success'} = {}){
		this.message = message
		this.type = type
		this.duration = duration

    this.render()
	}

	get template(){
		return `
			<div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
			    <div class="timer"></div>
			    <div class="inner-wrapper">
			      <div class="notification-header">${this.type}</div>
			      <div class="notification-body">
			        ${this.message}
			      </div>
			    </div>
			</div>
		`
	}

	render(){
		const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

		NotificationMessage.element && NotificationMessage.element.remove();
    NotificationMessage.element = this.element;
	}

	show(parentNode = document.body){
		parentNode.append(this.element)
		
		setTimeout(() => this.remove() , this.duration)
	}

	remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    NotificationMessage.element && NotificationMessage.element.remove();
  }
}
