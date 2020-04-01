import * as _moment from 'moment';

const moment = (_moment as any).default ? (_moment as any).default : _moment;

export class DatepickerOptions {

    	setStartAt(){
		let hoy = _moment();
		let min = Number(hoy.format('m'));

		if(min >= 0 && min < 10)
			return _moment().set('minute', 10);
		else if(min >= 10 && min < 20)
            	return _moment().set('minute', 20);
		else if(min >= 20 && min < 30)
            	return _moment().set('minute', 30);
		else if(min >= 30 && min < 40)
            	return _moment().set('minute', 40);
		else if(min >= 40 && min < 50)
           		return _moment().set('minute', 50);
		else if(min >= 50 && min <= 59)
            	return hoy.add(1, 'hours').set('minute', 0);
	}
}