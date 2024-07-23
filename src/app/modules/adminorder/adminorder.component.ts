import { Component, OnInit } from '@angular/core';
import { DataSharingService } from '../DataSharingService';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as bootstrap from 'bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-adminorder',
  templateUrl: './adminorder.component.html',
  styleUrls: ['./adminorder.component.css']
})
export class AdminorderComponent implements OnInit {
  userDetail: any;
  orderList: any[] = [];
  provincesData: any[] = [];
  productList: any[] = [];
  productTypeList: any[] = [];
  selectedOrder: any;
  updateOrder: FormGroup;
  userIdToDelete: string | null = null;


  constructor(
    private dataSharingService: DataSharingService,
    private callService: CallserviceService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.updateOrder = this.formBuilder.group({
      userId: '',
      address: '',
      province: '',
      zipcode: '',
      status: '',
      productId: this.formBuilder.array([]),
      quantity: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.dataSharingService.userDetail.subscribe(value => {
      const userDetailSession: any = sessionStorage.getItem("userDetail");
      this.userDetail = JSON.parse(userDetailSession);
      if (this.userDetail && this.userDetail.userId) {
        this.fetchOrdersAndProducts(this.userDetail.userId);
      }
    });

    this.getProductTypeAll();

    // ดึงข้อมูล orderList และ productList
    this.callService.getAllOrder().subscribe(res => {
      if (res.data) {
        this.orderList = res.data;
        this.orderList.forEach(order => {
          this.getUserDetails(order.userId).then(userData => {
            order.userData = userData;
          });
        });
        console.log("getAllOrder", this.orderList);
        // เรียกฟังก์ชัน getAllProduct() หลังจากดึง orderList แล้ว
        this.callService.getAllProduct().subscribe((res: any) => {
          if (res.data) {
            const allProducts = res.data;
            // เพิ่ม productList ในแต่ละ order
            this.orderList.forEach((order: any) => {
              order.productList = allProducts.filter((product: any) => order.productId.includes(product.productId));
              order.productList.forEach((product: any) => {
                product.imgList = [];
                this.callService.getProductImgByProductId(product.productId).subscribe((imgRes) => {
                  if (imgRes.data) {
                    this.getImageList(imgRes.data, product.imgList);
                  }
                });
              });
            });
          }
        });
      }
    });

    // รับข้อมูล userId จาก query params
    this.route.queryParams.subscribe(params => {
      this.userIdToDelete = params['userId'] || null;
    });
  }

  setDataForm(selectedOrder: any) {
    this.updateOrder.patchValue({
      userId: selectedOrder.userId,
      address: selectedOrder.address,
      province: selectedOrder.province,
      zipcode: selectedOrder.zipcode,
      status: selectedOrder.status,
    });
    this.updateOrder.setControl('productId', this.formBuilder.array(selectedOrder.productId || []));
    this.updateOrder.setControl('quantity', this.formBuilder.array(selectedOrder.quantity || []));
  }

  fetchOrdersAndProducts(userId: number): void {
    this.callService.getOrderByUserId(userId).subscribe(
      res => {
        if (res.status === 'SUCCESS' && res.data && res.data.length > 0) {
          this.orderList = res.data;
          this.orderList.forEach(order => {
            this.getUserDetails(order.userId);
          });

          this.callService.getAllProduct().subscribe(
            (res: any) => {
              if (res.data) {
                const allProducts = res.data;

                this.orderList.forEach((order: any) => {
                  order.productList = allProducts.filter((product: any) => order.productId.includes(product.productId));
                  order.productList.forEach((product: any) => {
                    product.imgList = [];
                    this.callService.getProductImgByProductId(product.productId).subscribe((imgRes) => {
                      if (imgRes.data) {
                        this.getImageList(imgRes.data, product.imgList);
                      }
                    });
                  });
                });
              }
            },
          );
        }
      }
    );
  }

  getProductTypeAll() {
    this.callService.getProductTypeAll().subscribe((res) => {
      if (res.data) {
        this.productTypeList = res.data;
      }
    });
  }

  getImageList(imageNames: any[], imgList: any[]) {
    for (let imageName of imageNames) {
      this.callService.getBlobThumbnail(imageName.productImgName).subscribe((res) => {
        if (res) {
          let objectURL = URL.createObjectURL(res);
          let safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          imgList.push(safeUrl);
        }
      });
    }
  }

  getUserDetails(userId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.callService.getByUserId(userId).subscribe(response => {
        if (response.status === 'SUCCESS') {
          resolve(response.data);
        } else {
          reject('Error fetching user details');
        }
      });
    });
  }

  getQuantity(order: any, productId: number): number {
    const productIndex = order.productId.indexOf(productId);
    return productIndex > -1 ? order.quantity[productIndex] : 0;
  }

  onDeleteOrder(ordersId: any) {
    if (ordersId) {
      this.callService.deleteOrder(ordersId).subscribe(res => {
        if (res.data) {
          window.location.reload();
        }
      });
    }
  }

  openModal(order: any) {
    this.selectedOrder = order;
    this.getUserDetails(order.userId);
    const orderModalElement = document.getElementById('orderModal');
    if (orderModalElement) {
      const orderModal = new bootstrap.Modal(orderModalElement);
      orderModal.show();
    } else {
      console.error('Element with id "orderModal" not found in the DOM.');
    }
    this.setDataForm(this.selectedOrder);
  }

  onSubmit(): void {
    const order = this.updateOrder.value;
    console.log(this.updateOrder);
    this.callService.updateOrder(order, this.selectedOrder.ordersId).subscribe(
      res => {
        if (res.data) {
          console.log(res.data);
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'แก้ไขข้อมูลสำเร็จ',
            confirmButtonText: 'ตกลง',
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
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
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด!',
          text: 'เกิดข้อผิดพลาดในการส่งข้อมูล',
          confirmButtonText: 'ตกลง',
        });
      }
    );
  }
}
