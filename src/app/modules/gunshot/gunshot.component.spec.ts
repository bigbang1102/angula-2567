/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GunshotComponent } from './gunshot.component';

describe('GunshotComponent', () => {
  let component: GunshotComponent;
  let fixture: ComponentFixture<GunshotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GunshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GunshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
