import { trigger, state, style, transition, animate, group, query, stagger, keyframes } from '@angular/animations';

export const SlideInOutAnimation = [
    trigger('slideInOut', [
        state('in', style({
            'opacity': '1', 'display': 'inline'
        })),
        state('out', style({
            'opacity': '0', 'display': 'none'
        })),
        transition('in => out', [group([
            animate('700ms ease-in-out', style({
                'display': 'none', 'opacity': '0'
            }))
        ]
        )]),
        transition('out => in', [group([
            animate('700ms ease-in-out', style({
                'display': 'inline'
            })),
            animate('400ms ease-in-out', style({
                'opacity': '1'
            }))
        ]
        )])
    ]),
]

export const SlideInOutAnimationHor = [
    trigger('slideInOut', [
        state('in', style({
            'max-height': '100%', 'opacity': '1', 'visibility': 'visible'
        })),
        state('out', style({
            'max-height': '0px', 'opacity': '0', 'visibility': 'hidden'
        })),
        transition('in => out', [group([
            animate('400ms ease-in-out', style({
                'opacity': '0'
            })),
            animate('600ms ease-in-out', style({
                'max-height': '0px'
            })),
            animate('700ms ease-in-out', style({
                'visibility': 'hidden'
            }))
        ]
        )]),
        transition('out => in', [group([
            animate('1ms ease-in-out', style({
                'visibility': 'visible'
            })),
            animate('600ms ease-in-out', style({
                'max-height': '100%'
            })),
            animate('800ms ease-in-out', style({
                'opacity': '1'
            }))
        ]
        )])
    ]),
]

export const FlyInOut = [
    trigger('flyInOut', [
        state('in', style({ transform: 'translateX(0)' })),
        transition('void => *', [
            style({transform: 'translateX(-100%)'}),
            animate(100)
        ]),
        transition('* => void', [
            animate(100, style({transform: 'translateX(100%)'}))
        ])
    ])
]