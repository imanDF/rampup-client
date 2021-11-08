import { Observable, Subscription } from 'rxjs';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';

import { Product } from './model';
import { EditService } from './edit.service';

import { map } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  loading: boolean;
  posts: any;
  private querySubscription: Subscription;

  public view: Observable<GridDataResult>;
  public gridState: State = {
    sort: [],
    skip: 0,
    take: 10,
  };
  public formGroup: FormGroup;

  private editedRowIndex: number;

  constructor(private editService: EditService, private apollo: Apollo) {}

  public ngOnInit(): void {
    this.querySubscription = this.editService
      .read()
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.view = data.getAllStudents;
      });
  }

  public onStateChange(state: State) {
    this.gridState = state;
    // this.editService.read();
  }

  public addHandler({ sender }) {
    this.closeEditor(sender);

    this.formGroup = new FormGroup({
      name: new FormControl(),
      age: new FormControl('', Validators.required),
      address: new FormControl(0),
      dateOfBirth: new FormControl(),
      mobileNumber: new FormControl(),
    });
    console.log(this.formGroup, '!!@#@!#!#!#!@#');
    sender.addRow(this.formGroup);
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);
    console.log(sender, 'sender');
    console.log(rowIndex, 'rowIndex');
    console.log(dataItem, 'dataItem');
    this.formGroup = new FormGroup({
      id: new FormControl(dataItem.id),
      name: new FormControl(dataItem.name),
      gender: new FormControl(dataItem.gender),
      age: new FormControl(dataItem.age),
      address: new FormControl(dataItem.address),
      dateOfBirth: new FormControl(dataItem.dateOfBirth),
      mobileNumber: new FormControl(dataItem.mobileNumber),
    });

    this.editedRowIndex = rowIndex;

    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }) {
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }) {
    const product: Product = formGroup.value;
    console.log(product, '1231321312233131');
    // this.editService.save(product, isNew);
    this.editService.save(product, isNew);
    sender.closeRow(rowIndex);
  }

  public removeHandler({ dataItem }) {}

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
}
