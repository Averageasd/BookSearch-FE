import { CommonModule } from '@angular/common';
import { Component, inject, OnInit} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, JsonPipe, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss' ,'../styles.scss']
})

export class AppComponent implements OnInit{
  readonly MIN_DATE_CONST : string = '0001-01-01T00:00:00';
  readonly MAX_DATE_CONST : string = '9999-12-31T23:59:59'
  title = 'BookSearch-FE';
  isInvalidForm :boolean | null = false;
  searchTerm:string = '';

  minDate: string = this.MIN_DATE_CONST;
  maxDate: string = this.MAX_DATE_CONST;
  advancedSearchAvailable:boolean = false;
  advancedSearchForm!: FormGroup;
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

  private fb: FormBuilder = inject(FormBuilder);
  ngOnInit(): void {
    this.advancedSearchForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      sortOrder: ['ASC'],
      sortColumn: ['created_at'],
      minCopies:[1],
      maxCopies:[1],
      minRating:[0],
      maxRating:[0]
    });

    this.advancedSearchForm.valueChanges.subscribe((value) => {
      this.validateAdvancedSearchForm();
    });
  }

  private checkCopiesInput(minCopies: number, maxCopies: number): boolean{
    if (minCopies === null || maxCopies === null){
      this.formErrors.push('min copies is null or max copies is null');
      return false;
    }

    if (minCopies <= 0 || maxCopies <= 0){
      this.formErrors.push('min copies is 0 or max copies is 0');
      return false;
    }

    if (String(minCopies).includes('.') || String(maxCopies).includes('.')){
      this.formErrors.push('min copies and max copies have to be integers');
      return false;
    }

    if (minCopies > maxCopies){
      this.formErrors.push('max copies cannot be smaller than min copies');
      return false;
    }
    return true;
  }

  private checkRatingInput(minRating: number, maxRating: number): boolean{
    if (minRating === null || maxRating === null){
      this.formErrors.push('min rating or max rating is empty');
      return false;
    }

    if (minRating < 0 || maxRating < 0){
      this.formErrors.push('min rating is smaller than 0 or max rating is smaller than 0');
      return false;
    }

    if (minRating > maxRating){
      this.formErrors.push('max rating cannot be smaller than min rating');
      return false;
    }
    return true;
  }

  private checkDateRangeInput(minDate: string, maxDate: string): boolean{
    let convertedMinDate = new Date(this.MIN_DATE_CONST);
    let convertedMaxDate = new Date(this.MAX_DATE_CONST);
    if (minDate !== ''){
      convertedMinDate = new Date(`${minDate}T00:00:00`);
    }

    if (maxDate !== ''){
      convertedMaxDate = new Date(`${maxDate}T23:59:59`);
    }
    console.log(convertedMinDate, convertedMaxDate);

    if (convertedMinDate > convertedMaxDate){
      this.formErrors.push('min date has to be smaller than max date');
      return false;
    }
    return true;
  }

  private validateAdvancedSearchForm(): void{
    const {startDate, endDate, sortOrder, sortColumn, minCopies, maxCopies, minRating, maxRating} = this.advancedSearchForm.value;
    this.formErrors = [];
    const copyInputValidationRes = this.checkCopiesInput(minCopies, maxCopies);
    const ratingInputValidationRes = this.checkRatingInput(minRating, maxRating);
    const dateRangeInputValidationRes = this.checkDateRangeInput(startDate, endDate);
    if (!copyInputValidationRes || !ratingInputValidationRes || !dateRangeInputValidationRes){
      this.isInvalidForm = true;
      return;
    }
    this.isInvalidForm = false;
  }

  toggleAdvancedSearch(): void{
    this.advancedSearchAvailable = !this.advancedSearchAvailable;
  }
}
