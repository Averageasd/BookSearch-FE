import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { AfterViewChecked, Component, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BookModel } from './model/BookModel';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss' ,'../styles.scss']
})

export class AppComponent implements OnInit, AfterViewChecked{
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
  private httpClient: HttpClient = inject(HttpClient);
  private page: number = 0;
  bookModels: BookModel[] = [];
  @ViewChild('lastBookObserver') targetObserver?: ElementRef;
  options = { rootMargin: '0px', threshold: 0.5, root: null }
  observer: IntersectionObserver = new IntersectionObserver(this.handleObserver.bind(this), this.options);
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

    this.submitForm();
  }

  ngAfterViewChecked(): void {
    if (this.targetObserver) {
      this.observer.observe(this.targetObserver?.nativeElement);
    }
  }

  handleObserver(entries: any[]) {
    entries.forEach(entry => {
      const {
      boundingClientRect,
      intersectionRatio,
      intersectionRect,
      isIntersecting,
      rootBounds,
      target,
      time
      } = entry;
      console.log(entry)
      if (isIntersecting) {
        this.scrollForm();
        console.log('called');
      }
    })

  };

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

  private convertInputStrDateToDate(date: string, isMinDate: boolean){
    if (date === ''){
      if (isMinDate){
        return new Date(this.MIN_DATE_CONST);
      }
      return new Date(this.MAX_DATE_CONST);
    }
    if (isMinDate){
      return new Date(`${date}T00:00:00`);
    }
    return new Date(`${date}T23:59:59`);
    
  }

  private checkDateRangeInput(minDate: string, maxDate: string): boolean{
    let convertedMinDate = this.convertInputStrDateToDate(minDate, true);
    let convertedMaxDate = this.convertInputStrDateToDate(maxDate, false);
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

  private getLocalDateForFormSubmit(date: Date, isMinDate: boolean): string{
    let day = String(date.getDate());      // Day of the month (1–31)
    let month = String(date.getMonth() + 1);   // Month (0–11) → add 1 to get 1–12
    let year = String(date.getFullYear());
    if (day.length === 1){
      day = '0' + day;
    }

    if (month.length === 1){
      month = '0' + month;
    }

    let additionalPrefixZeros = '';
    for (let i = 0; i<(4 - year.length); i++){
      additionalPrefixZeros += '0';
    }
    year = additionalPrefixZeros + year;
    if (isMinDate){
      return `${year}-${month}-${day}T00:00:00`;
    }
    return `${year}-${month}-${day}T23:59:59`;
  }

  private getParams(): HttpParams{
    const {startDate, endDate, sortOrder, sortColumn, minCopies, maxCopies, minRating, maxRating} = this.advancedSearchForm.value;
    const params = new HttpParams()
    .set('page',this.page)
    .set('sortColumn', sortColumn)
    .set('sortOrder', sortOrder)
    .set('searchTerm', this.searchTerm)
    .set('minCreatedAt',this.getLocalDateForFormSubmit(this.convertInputStrDateToDate(startDate, true), true))
    .set('maxCreatedAt', this.getLocalDateForFormSubmit(this.convertInputStrDateToDate(endDate, false), false))
    .set('minCopies', minCopies)
    .set('maxCopies', maxCopies)
    .set('minRatings', minRating)
    .set('maxRatings', maxRating);
    return params;
  } 

  submitForm(): void {
    if (this.isInvalidForm){
      return;
    }
    this.page = 0;
    this.bookModels = [];
    this.scrollForm();
    
  }

  scrollForm(): void{
    const params = this.getParams();
    this.httpClient.get<BookModel[]>('http://localhost:8282/api/book/all-books', {params})
    .subscribe((data: BookModel[])=>{
      this.bookModels = this.bookModels.concat(data);
      this.advancedSearchAvailable = false;
      console.log(this.bookModels);
      this.page++;
    });
  }
}
