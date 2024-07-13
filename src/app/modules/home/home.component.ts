import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  cartItems: any[] = [];
  totalCost: number = 0;
  productList: any[] = [];
  productTypeList: any[] = [];
  isCartVisible: boolean = false;
  cartItemCount: number = 0;  // ตัวแปรสำหรับเก็บจำนวนรายการในตะกร้า

  constructor(
    private callService: CallserviceService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getCartItems(); // เรียกใช้งานเพื่อดึงข้อมูลตะกร้าทุกครั้งที่โหลด Component
    this.getProductTypeAll();
    this.getAllProducts();
  }

  getCartItems() {
    let storedCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    this.cartItems = storedCartItems;
    console.log(this.cartItems)
    for (let cart of this.cartItems) {
      this.callService.getBlobThumbnail(cart.imageName).subscribe(res => {
        let objectURL = URL.createObjectURL(res);
        let imageBlobUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL) as SafeResourceUrl;
        cart.imageUrl = imageBlobUrl


      });

    }

    this.calculateTotalCost();
    this.updateCartItemCount();

  }


  calculateTotalCost() {
    this.totalCost = this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  updateCartItemCount() {
    this.cartItemCount = this.cartItems.reduce((count, item) => count + item.quantity, 0);
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
      // imgList.push(imageBlobUrl);
      imgList.push({
        key: fileName,
        value: imageBlobUrl,

      });
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
        name: product.productName,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imgList[0].value,
        imageName: product.imgList[0].key
      };
      console.log(cartItem)
      this.cartItems.push(cartItem);
      this.calculateTotalCost();
      this.updateCartItemCount();
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));

      Swal.fire({
        icon: 'success',
        title: 'เพิ่มสินค้าลงในตะกร้าเรียบร้อย',
        width: 300,
        padding: '1em',
        color: '#716add',
        background: '#fff url(/images/trees.png)',
        backdrop: `rgba(0, 0, 123, 0.4) url("https://media4.giphy.com/media/7lsw8RenVcjCM/200w.gif?cid=82a1493bt9it700ua4cwnujwx6qj0513iogzj5fc5rdr4o7b&ep=v1_gifs_related&rid=200w.gif&ct=g") left top no-repeat`
      });
    }
  }

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.calculateTotalCost();
    this.updateCartItemCount(); // อัปเดตจำนวนรายการในตะกร้า
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  toggleCart() {
    this.isCartVisible = !this.isCartVisible;
    this.getCartItems()

  }

  buyNow() {
    this.router.navigate(['/buynow'], { state: { cartItems: this.cartItems, totalCost: this.totalCost } });
  }
}