import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'

interface SortOrder {
  value: string;
  viewValue: string;
};

interface SortColumn {
  value: string;
  viewValue: string;
};

@Component({
  selector: 'app-root',
  providers:[],
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss' ,'../styles.scss']
})

export class AppComponent {
  title = 'BookSearch-FE';
  sortOrders: SortOrder[] = [
    {value: 'ASC', viewValue: 'Ascending'},
    {value: 'DESC', viewValue: 'Descending'},
  ];

  sortColumns: SortColumn[] = [
    {value: 'created_at', viewValue: 'Book creation date'},
    {value: 'copies', viewValue: 'Number of copies'},
    {value: 'rating', viewValue: 'Book rating'},
    {value: 'title', viewValue: 'Book title'}
  ];
}
