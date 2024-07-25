
import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DataSharingService } from '../DataSharingService';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-adminorder',
  templateUrl: './adminorder.component.html',
  styleUrls: ['./adminorder.component.css']
})
export class AdminorderComponent implements OnInit {
  updateForm: FormGroup;
  orderList: any[] = [];
  provincesData: any[] = [];
  productTypeList: any[] = [];
  userDetail: any;
  selectedProduct: any;
  ordersId: any
  paymentImages: any[] = [];
  selected: any;
  selecteds: number;
  selectedOrder: any;
  allimgs: any[] = [];
  grandTotal: number = 0;


  // ImageList: { key: string, value: SafeUrl }[] = [];


  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private dataSharingService: DataSharingService,
    private router: Router,
    private formBuilder: FormBuilder,

  ) {

    this.updateForm = this.formBuilder.group({
      userId: '',
      address: '',
      province: '',
      zipcode: '',
      status: '',
      productId: this.formBuilder.array([]),
      quantity: this.formBuilder.array([]),
    });
  }
  statuses = [
    { value: '1', label: 'กำลังตรวจสอบ' },
    { value: '2', label: 'ชำระเงินเรียบร้อยเเล้ว' },
    { value: '3', label: 'ยังไม่ชำระเงิน' },
    { value: '4', label: 'ชำระเงินไม่ครบตามจำนวน' }
  ];

  ngOnInit() {

    // ดึงข้อมูล orderList

    this.callService.getAllOrder().subscribe(res => {
      if (res.data) {
        this.orderList = res.data;
        console.log('ข้อมูล', this.orderList);


        this.orderList.forEach(order => {
          this.getUserDetails(order.userId).then(userData => {
            order.userData = userData;
          });
        });


        this.callService.getAllPaymentImage().subscribe(
          (data: any) => {
            const paymentImages = data.data;
            // console.log('paymentImages', paymentImages);



            this.orderList.forEach((order: any) => {

              // กรองภาพการชำระเงินที่ตรงกับ ordersId ใน orderList
              order.paymentImage = paymentImages.filter((payment: any) => order.ordersId === payment.ordersId);

              order.paymentImage.forEach((payment: any) => {
                console.log('paymentImagesssssssssssssss', order.paymentImage);
                payment.imgList = [];
                this.callService.getPaymentImgByUserId(payment.ordersId).subscribe((imgRes: any) => {
                  if (imgRes.data) {
                    this.getImage(imgRes.data, payment.imgList);
                  }
                });
              });
            });

            // Log เพื่อตรวจสอบข้อมูล
            console.log('orderList with payment images', this.orderList);
          },
          (error: any) => {
            console.error('Error fetching payment images', error);
          }
        );



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

  getImage(imageNames: any[], imgList: any[]) {
    for (let imageName of imageNames) {
      console.log('paymentImagesssssssssssssss', imageName);
      this.callService.getPaymentImgBlobThumbnail(imageName.paymentImgName).subscribe((res) => {
        if (res) {
          let objectURL = URL.createObjectURL(res);
          let safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          imgList.push(safeUrl);
        }
      });
    }
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
  calculateTotalSum(order: any): number {
    return order.productList.reduce((total: number, product: any) => {
      return total + (product.price * this.getQuantity(order, product.productId));
    }, 0);
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


  setDataForm(selectedProduct: any): void {
    this.updateForm.patchValue({
      userId: selectedProduct.userId,
      address: selectedProduct.address,
      province: selectedProduct.province,
      zipcode: selectedProduct.zipcode,
      status: selectedProduct.status,
    });

    this.updateForm.setControl(
      'productId',
      this.formBuilder.array(selectedProduct.productId || [])
    );
    this.updateForm.setControl(
      'quantity',
      this.formBuilder.array(selectedProduct.quantity || [])
    );
  }

  setSelectedProduct(order: any): void {
    this.selectedProduct = order;
    console.log('Selected Product:', this.selectedProduct);
    this.setDataForm(order);
  }

  onSubmit(): void {
    console.log('Form Values:', this.updateForm.value);

    const order = this.updateForm.value;

    console.log('Request Payload:', {
      order: order,
      ordersId: this.selectedProduct.ordersId
    });

    this.callService.updateOrder(order, this.selectedProduct.ordersId).subscribe(
      res => {
        console.log('Response:', res);
        if (res.data) {
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
        console.error('Error:', error);
      }
    );
  }

  setSelectedOrderId(orderId: any) {
    const queryParams = {
      responseData: orderId
    };
    this.router.navigate(['/order'], { queryParams });
    console.log('responseData', orderId);
  }
  setSelected(payment: any, totalSum: number) {
    this.selected = payment;
    this.selecteds = totalSum;
    console.log('Selected Payment:', this.selected);
    console.log('Selected Total Sum:', this.selecteds);
  }

  getPrompay(order: any) {
    this.callService.getPaymentImgByUserId(order.ordersId).subscribe((imgRes: any) => {
      if (imgRes.data) {
        order.allimgs = [];
        this.getImage(imgRes.data, order.allimgs);
      }
    });
  }

  setSelectedOrder(order: any): void {
    this.selectedOrder = order;
    this.getPrompay(this.selectedOrder);
    console.log('Selected Order:', this.selectedOrder);
  }


}
