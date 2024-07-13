import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

interface Product {
  productId: any;
  productName: string;
  productDesc: string;
  price: number;
  quantity: number;
  productTypeId: any;
  imgList: SafeResourceUrl[];
  productType?: any; // ปรับให้สามารถเป็น undefined ได้
}

interface ProductType {
  productTypeId: any;
  productTypeName: string;
  productTypeDesc: string;
}

interface ProductImg {
  productImgName: string;
}

@Component({
  selector: 'app-manageProduct',
  templateUrl: './manageProduct.component.html',
  styleUrls: ['./manageProduct.component.css']
})
export class ManageProductComponent implements OnInit {

  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private activated: ActivatedRoute,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

  imageBlobUrl: any;
  imageBlobUrls: any = [];
  productImgList: any;
  productList: Product[] = [];
  productTypeList: ProductType[] = [];
  selectedFiles: any = [];
  isSubmit: boolean = false;

  ngOnInit() {
    this.getProductTypeAll();
    this.callService.getAllProduct().subscribe(res => {
      if (res.data) {
        this.productList = res.data;
        for (let product of this.productList) {
          product.imgList = [];
          product.productType = this.productTypeList.find(type => type.productTypeId === product.productTypeId); // แมปประเภทสินค้า
          this.callService.getProductImgByProductId(product.productId).subscribe((res) => {
            if (res.data) {
              this.productImgList = res.data;
              for (let productImg of this.productImgList) {
                this.getImage(productImg.productImgName, product.imgList);
              }
            } else {
              window.location.reload();
            }
          });
        }
        this.cdr.detectChanges(); // บังคับให้ตรวจสอบและอัปเดต DOM
      }
    });
  }

  productForm = this.formBuilder.group({
    productName: '',
    productDesc: '',
    price: parseFloat('0').toFixed(2),
    quantity: 0,
    productTypeId: '',
    files: [],
    productId: ''
  });

  getImage(fileNames: any, imgList: any) {
    this.callService.getBlobThumbnail(fileNames).subscribe((res) => {
      let objectURL = URL.createObjectURL(res);
      this.imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      imgList.push(this.imageBlobUrl);
      this.cdr.detectChanges();
    });
  }

  getProductTypeAll() {
    this.callService.getProductTypeAll().subscribe((res) => {
      if (res.data) {
        this.productTypeList = res.data;
        console.log('Product types loaded:', this.productTypeList); // ตรวจสอบข้อมูลที่โหลด
      }
    });
  }

  onDeleteProduct(productId: any) {
    if (productId) {
      this.callService.deleteProduct(productId).subscribe(res => {
        if (res.data) {
          window.location.reload();
        }
      });
    }
  }

  onSubmit() {
    this.isSubmit = true;
    if (this.validator()) {
      const data = this.productForm.value;
      this.callService.saveProduct(data).subscribe(res => {
        if (res.data) {
          const productId = res.data;
          for (const file of this.selectedFiles[0]) {
            const formData = new FormData();
            formData.append('file', file);
            this.callService.saveImage(formData, productId).subscribe(resImg => {
              if (resImg.data) {
                const product = this.productList.find((product: Product) => product.productId === productId);
                if (product) {
                  this.getImage(resImg.data, product.imgList);
                }
              }
            });
          }
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'บันทึกข้อมูลสำเร็จ',
            confirmButtonText: 'ตกลง',
          }).then(res => {
            if (res.isConfirmed) {
              this.router.navigate(['/manage-product']);
            }
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'บันทึกไม่สำเร็จ!',
            text: 'กรุณาตรวจสอบข้อมูล ด้วยค่ะ',
            confirmButtonText: 'ตกลง',
          });
        }
      });
    }
  }

  onUpdateProduct(productId: any) {
    this.router.navigate(['/product/' + productId]);
  }

  onFileChanged(event: any) {
    this.selectedFiles = []; // เคลียร์ไฟล์เก่า
    this.selectedFiles.push(event.target.files);
  }

  onKeyPrice(event: any) {
    return parseFloat(event.target.result).toFixed(2);
  }

  setDataDecimal(data: any) {
    this.productForm.patchValue({
      price: parseFloat(data).toFixed(2),
    });
  }

  fixDecimals() {
    let value = this.productForm.value.price;
    return this.setDataDecimal(value);
  }

  validator() {
    if (this.productForm.valid) {
      return true;
    } else {
      return false;
    }
  }

  setSubmit() {
    this.isSubmit = false;
  }
}
