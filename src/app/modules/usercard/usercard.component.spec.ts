/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UsercardComponent } from './usercard.component';

describe('UsercardComponent', () => {
  let component: UsercardComponent;
  let fixture: ComponentFixture<UsercardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsercardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsercardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
