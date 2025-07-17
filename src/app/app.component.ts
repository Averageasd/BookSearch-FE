import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {JsonPipe} from '@angular/common';

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
  imports: [CommonModule, FormsModule, JsonPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss' ,'../styles.scss']
})

export class AppComponent implements OnInit{

  title = 'BookSearch-FE';
  isInvalidForm :boolean | null = false;
  searchTerm:string = '';
  sortOrder:string = 'DESC';
  sortColumn:string = 'created_at';
  minCopies:number = 1;
  maxCopies:number = 1;
  minRating: number = 0;
  maxRating: number = 0;
  minDate: string = '0001-01-01T00:00:00Z';
  maxDate: string = '9999-12-31T23:59:59Z';
  advancedSearchAvailable:boolean = false;

  // we want to make sure angular does not query this element before ngOnInit thus preventing it from being null unexpectedly.
  @ViewChild('myForm', { static: false }) form!: NgForm;
  formErrors: string[] = [];

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
  ngOnInit(): void {
    if (this.form && this.form.statusChanges){
      this.form.statusChanges?.subscribe(()=>{
        console.log('get called?');
        this.formErrors = [];
        if (!this.checkCopiesInput() || !this.checkRatingInput()){
          this.isInvalidForm = true;
        }
        else{
          this.isInvalidForm = false;
        }
      });
    }
  }

  private checkCopiesInput(): boolean{
    const minCopies:string = String(this.form.controls['mincopies']?.value ?? '');
    const maxCopies:string = String(this.form.controls['maxcopies']?.value ?? '');
    console.log(typeof(minCopies));
    console.log(minCopies, maxCopies);
    if (!minCopies || !maxCopies){
      this.formErrors.push('min copies or max copies is empty');
      return false;
    }
    if (minCopies.includes('.') || maxCopies.includes('.')){
      this.formErrors.push('min copies and max copies have to be whole numbers')
      return false;
    }
    let minCopiesNum: number = Number(minCopies);
    let maxCopiesNum: number = Number(maxCopies);
    if (maxCopiesNum < minCopiesNum){
      return false;
    }
    return true;
  }

  private checkRatingInput(): boolean{
    const minRating:string = String(this.form.controls['minrating']?.value);
    const maxRating:string = String(this.form.controls['maxrating']?.value);
    if (minRating === null || maxRating === null){
      return false;
    }
    let minRatingNum: number = Number(minRating);
    let maxRatingNum: number = Number(maxRating);
    if (maxRatingNum < minRatingNum){
      return false;
    }
    return true;
  }

  toggleAdvancedSearch(): void{
    this.advancedSearchAvailable = !this.advancedSearchAvailable;
  }
}
