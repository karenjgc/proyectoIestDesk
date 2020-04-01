import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchfilter'
})

@Injectable()
export class SearchFilterPipe implements PipeTransform {
    public transform(value, keys: string, term: string) {
        if (!term) return value;
        return (value || []).filter((item) => keys.split(',').some(key => item.hasOwnProperty(key) && new RegExp(term.trim(), 'gi').test(item[key])));
    }   
}