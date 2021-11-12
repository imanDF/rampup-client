import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subscriber } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { tap, map } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';
import { Socket } from 'ngx-socket-io';
import io from 'socket.io-client';

const GET_STUDENTS = gql`
  query {
    getAllStudents {
      id
      name
      age
      address
      mobileNumber
      dateOfBirth
      gender
    }
  }
`;
const REMOVE_STUDENT = gql`
  mutation ($id: String!) {
    removeStudent(id: $id) {
      name
    }
  }
`;
const UPDATE_STUDENT = gql`
  mutation ($student: StudentUpdateDTO!) {
    updateStudent(student: $student) {
      name
    }
  }
`;
const CREATE_STUDENT = gql`
  mutation ($student: StudentCreateDTO!) {
    createStudent(student: $student) {
      name
    }
  }
`;
@Injectable({
  providedIn: 'root',
})
export class EditService {
  readonly uri:string = "ws://localhost:3001";
  sockt:any;
  constructor(
    private apollo: Apollo,
    private http: HttpClient,
    private socket: Socket
  ) {
    this.sockt = io(this.uri);
  }

  private data: any[] = [];

  public read() {
    return this.apollo.watchQuery<any>({
      query: GET_STUDENTS,
    }).valueChanges;
  }


  listen(eventName:string){
    return new Observable((subscriber) => {
      this.sockt.on(eventName,(data)=> {
        subscriber.next(data);
      })
    })
  }

  public save(data: any, isNew?: boolean) {
    try {
      if (isNew) {
        return this.apollo
          .mutate({
            mutation: CREATE_STUDENT,
            variables: { student: data },
          })
      } else {
        return this.apollo
          .mutate({
            mutation: UPDATE_STUDENT,
            variables: { student: data },
          })
      }
    } catch (error) {
      console.log(error, 'error');
      throw new Error(error);
    }
  }

  public delete(id: string) {
    try {
      return this.apollo
        .mutate({
          mutation: REMOVE_STUDENT,
          variables: { id },
        });
    } catch (error) {
      console.log(error, 'error');
      throw new Error(error);
    }
  }

  public addExcel(file) {
    try {
      return this.http.post('http://localhost:4000', file);
    } catch (error) {
      console.log(error, 'error');
      throw new Error(error);
    }
  }
  private reset() {
    this.data = [];
  }
}
