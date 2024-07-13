import { Component, OnInit } from '@angular/core';
import { DataSharingService } from '../DataSharingService';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-usercard',
  templateUrl: './usercard.component.html',
  styleUrls: ['./usercard.component.css']
})
export class UsercardComponent implements OnInit {

  userDetail: any;
  orderList: any[] = [];
  provincesData: any[] = [];
  productList: any[] = [];
  userData: any;
  selectedOrder: any;

  constructor(
    private dataSharingService: DataSharingService,
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.dataSharingService.userDetail.subscribe(value => {
      const userDetailSession: any = sessionStorage.getItem("userDetail");
      this.userDetail = JSON.parse(userDetailSession);
      if (this.userDetail && this.userDetail.userId) {
        this.fetchOrdersAndProducts(this.userDetail.userId);
      }
    });
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
                const allProducts = res.data; // Get all products from res.data

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

  getUserDetails(userId: number): void {
    this.callService.getByUserId(userId).subscribe(
      response => {
        if (response.status === 'SUCCESS') {
          this.userData = response.data;
        }
      },
    );
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
  }
}
