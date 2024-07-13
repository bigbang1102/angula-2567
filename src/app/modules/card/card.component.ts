import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  cartItems: any[] = [];
  totalCost: number = 0;
  productList: any[] = [];
  productTypeList: any[] = [];
  isCartVisible: boolean = false;

  constructor(
    private callService: CallserviceService, // เปลี่ยนชื่อเซอร์วิสตามโครงสร้างของโปรเจค
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getCartItems();
    this.getProductTypeAll();
    this.getAllProducts();
  }

  getCartItems() {
    let storedCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    this.cartItems = storedCartItems;
    this.calculateTotalCost();
  }

  calculateTotalCost() {
    this.totalCost = this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getAllProducts() {
    this.callService.getAllProduct().subscribe(res => {
      if (res.data) {
        this.productList = res.data;
        for (let product of this.productList) {
          product.imgList = [];
          if (typeof product.quantityToAdd === 'undefined') {
            product.quantityToAdd = 1; // ตั้งค่าเริ่มต้นของ quantityToAdd ถ้ายังไม่ถูกตั้งค่า
          }
          product.productType = this.productTypeList.find(x => x.id === product.productTypeId);
          this.getProductImages(product.productId, product.imgList);
        }
      }
    });
  }

  getProductImages(productId: number, imgList: SafeResourceUrl[]) {
    this.callService.getProductImgByProductId(productId).subscribe(resImg => {
      if (resImg.data) {
        let productImgList = resImg.data;
        for (let productImg of productImgList) {
          this.getImage(productImg.productImgName, imgList);
        }
      } else {
        window.location.reload();
      }
    });
  }

  getImage(fileName: string, imgList: SafeResourceUrl[]) {
    this.callService.getBlobThumbnail(fileName).subscribe(res => {
      let objectURL = URL.createObjectURL(res);
      let imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL) as SafeResourceUrl;
      imgList.push(imageBlobUrl);
    });
  }

  getProductTypeAll() {
    this.callService.getProductTypeAll().subscribe(res => {
      if (res.data) {
        this.productTypeList = res.data;
      }
    });
  }

  addToCart(productId: number, quantity: number) {
    if (!quantity || quantity < 1) {
      return; // ตรวจสอบว่าจำนวนที่กดเข้ามามีค่าถูกต้องหรือไม่
    }

    const product = this.productList.find(p => p.productId === productId);

    if (product) {
      const cartItem = {
        productId: productId,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imgList[0]
      };

      this.cartItems.push(cartItem);
      this.calculateTotalCost();
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    }
  }

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.calculateTotalCost();
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  toggleCart() {
    this.isCartVisible = !this.isCartVisible;
  }
}
