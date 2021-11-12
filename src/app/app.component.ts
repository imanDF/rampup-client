import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';

import { Product } from './model';
import { EditService } from './edit.service';

import { map } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';
import moment from 'moment';

import { NotificationService } from '@progress/kendo-angular-notification';
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  loading: boolean;
  selectedStudent: any;
  refreshStudents = new BehaviorSubject<boolean>(true);
  fileName = '';
  excelFile: any;
  responseNotification: any;

  private querySubscription: Subscription;
  private editedRowIndex: number;

  public view: Observable<GridDataResult>;
  public gridState: State = {
    sort: [],
    skip: 0,
    take: 10,
  };
  public formGroup: FormGroup;
  public opened = false;

  constructor(
    private editService: EditService,
    private apollo: Apollo,
    private notificationService: NotificationService
  ) {}

  public ngOnInit(): void {
    this.initLoad();
    this.editService.listen('notification').subscribe((data) => {
      this.notificationService.show({
        content: `${data}`,
        hideAfter: 2000,
        position: { horizontal: 'center', vertical: 'top' },
        animation: { type: 'fade', duration: 400 },
        type: { style: 'success', icon: true },
      });
    });
  }
  private initLoad() {
    this.querySubscription = this.editService
      .read()
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.view = data.getAllStudents.map((item) => {
          const nowDate = moment();
          const dob = moment(item.dateOfBirth, 'YYYY');
          let updatedItem = {
            ...item,
            age: nowDate.diff(dob, 'years'),
          };
          return updatedItem;
        });
      });
  }

  public onStateChange(state: State) {
    this.gridState = state;
  }

  public addHandler({ sender }) {
    this.closeEditor(sender);

    this.formGroup = new FormGroup({
      name: new FormControl(),
      address: new FormControl(0),
      gender: new FormControl(),
      dateOfBirth: new FormControl(new Date()),
      mobileNumber: new FormControl(),
      age: new FormControl('22'),
    });
    sender.addRow(this.formGroup);
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);
    this.formGroup = new FormGroup({
      id: new FormControl(dataItem.id),
      name: new FormControl(dataItem.name),
      age: new FormControl(''),
      gender: new FormControl(dataItem.gender),
      address: new FormControl(dataItem.address),
      dateOfBirth: new FormControl(new Date(dataItem.dateOfBirth)),
      mobileNumber: new FormControl(dataItem.mobileNumber),
    });

    this.editedRowIndex = rowIndex;

    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }) {
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }) {
    let updatedObj = {
      ...formGroup.value,
      dateOfBirth: moment(formGroup.value.dateOfBirth).format('YYYY-MM-DD'),
    };
    let product: Product = updatedObj;
    this.editService.save(product, isNew).subscribe(
      (res: any) => {
        this.notificationService.show({
          content: isNew ? 'Added Successfully' : 'Updated Successfully',
          hideAfter: 2000,
          position: { horizontal: 'center', vertical: 'top' },
          animation: { type: 'fade', duration: 400 },
          type: { style: 'success', icon: true },
        });
      },
      (error) => {
        this.notificationService.show({
          content: isNew ? 'Failed to add' : 'Failed to update',
          hideAfter: 2000,
          position: { horizontal: 'center', vertical: 'top' },
          animation: { type: 'fade', duration: 400 },
          type: { style: 'success', icon: true },
        });
      }
    );
    sender.closeRow(rowIndex);
  }

  public removeHandler() {
    let dataItem = this.selectedStudent;
    this.opened = true;
    this.editService.delete(dataItem.id).subscribe(
      (res: any) => {
        this.notificationService.show({
          content: `Removed Successfully`,
          hideAfter: 2000,
          position: { horizontal: 'center', vertical: 'top' },
          animation: { type: 'fade', duration: 400 },
          type: { style: 'success', icon: true },
        });
      },
      (error) => {
        this.notificationService.show({
          content: `Failed to remove Student`,
          hideAfter: 2000,
          position: { horizontal: 'center', vertical: 'top' },
          animation: { type: 'fade', duration: 400 },
          type: { style: 'success', icon: true },
        });
      }
    );
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  public openRemoveDialog({ dataItem }) {
    this.opened = true;
    this.selectedStudent = dataItem;
  }

  public close(status) {
    if (status === 'yes') {
      this.removeHandler();
    }
    this.opened = false;
    this.initLoad();
  }

  public handleFileInput(file: Event) {
    this.excelFile = file;
  }

  public submitFile() {
    const formData = new FormData();
    formData.append('file', this.excelFile);
    this.editService.addExcel(formData).subscribe();
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
}
