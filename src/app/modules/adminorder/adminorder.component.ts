import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DataSharingService } from '../DataSharingService';
// import * as bootstrap from 'bootstrap';
@Component({
  selector: 'app-adminorder',
  templateUrl: './adminorder.component.html',
  styleUrls: ['./adminorder.component.css']
})
export class AdminorderComponent implements OnInit {
  orderList: any[] = [];
  provincesData: any[] = [];
  productTypeList: any[] = [];
  userDetail: any;

  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private dataSharingService: DataSharingService,
  ) { }

  ngOnInit() {

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
          window.location.reload()

        }
      })
    }
  }

  // openModal(order: any) {
  //   this.userDetail = order;
  //   this.getUserDetails(order.userId);

  //   const orderModalElement = document.getElementById('orderModal');
  //   if (orderModalElement) {
  //     const orderModal = new bootstrap.Modal(orderModalElement);
  //     orderModal.show();
  //   } else {
  //     console.error('Element with id "orderModal" not found in the DOM.');
  //   }
  // }

}
