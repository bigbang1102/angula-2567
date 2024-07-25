import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullwidthComponent } from './fullwidth.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { HomeComponent } from 'src/app/modules/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NgxLoadingModule } from 'ngx-loading';
import { RegisterComponent } from 'src/app/modules/register/register.component';
import { LoginComponent } from 'src/app/modules/login/login.component';
import { DashbordAdminComponent } from 'src/app/modules/dashbordAdmin/dashbordAdmin.component';
import { ProfileComponent } from 'src/app/modules/profile/profile.component';
import { ManageUserComponent } from 'src/app/modules/manageUser/manageUser.component';
import { ManageProductComponent } from 'src/app/modules/manageProduct/manageProduct.component';
import { ProductComponent } from 'src/app/modules/product/product.component';
import { UpdateProductComponent } from 'src/app/modules/updateProduct/updateProduct.component';
import { ReportComponent } from 'src/app/modules/report/report.component';
import { CardComponent } from 'src/app/modules/card/card.component';
import { UserhomeComponent } from 'src/app/modules/userhome/userhome.component';
import { BuynowComponent } from 'src/app/modules/buynow/buynow.component';
import { UsercardComponent } from 'src/app/modules/usercard/usercard.component';
import { AdminorderComponent } from 'src/app/modules/adminorder/adminorder.component';
import { GunshotComponent } from 'src/app/modules/gunshot/gunshot.component';



@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    SharedModule,
    FormsModule,
    NgxPermissionsModule.forRoot(),
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({})
  ],
  declarations: [
    FullwidthComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    DashbordAdminComponent,
    ProfileComponent,
    ManageUserComponent,
    ManageProductComponent,
    ProductComponent,
    UpdateProductComponent,
    ReportComponent,
    CardComponent,
    UserhomeComponent,
    BuynowComponent,
    UsercardComponent,
    AdminorderComponent,
    GunshotComponent

  ]
})
export class FullwidthModule { }
