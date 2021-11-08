import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { tap, map } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';

const CREATE_ACTION = 'create';
const UPDATE_ACTION = 'update';
const REMOVE_ACTION = 'destroy';

// const UPDATE_STUDENT = gql`
// mutation {
//   updateStudent(
//   	student:{
//       $studentDetails
//     }
//   )
//   {
//     name
//   }
// }
// `;

const GET_POST = gql`
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
@Injectable()
export class EditService {
  constructor(private apollo: Apollo, private http: HttpClient) {}

  private data: any[] = [];

  public read() {
    return this.apollo.watchQuery<any>({
      query: GET_POST,
    }).valueChanges;
  }

  public save(data: any, isNew?: boolean) {
    if (isNew) {
    } else {
      this.apollo.mutate({
        mutation: gql`
            mutation {
              updateStudent(
                student:{
                    id:${data.id},
                    name:${data.name},
                    age:${data.age},
                    address: ${data.address},
                    mobileNumber: ${data.mobileNumber},
                    dateOfBirth: ${data.dateOfBirth},
                    gender:${data.gender}
                }
              )
              {
                name
              }
            }
            `,
      });
    }
  }

  private reset() {
    this.data = [];
  }
}
