import { Component, OnInit, OnDestroy, ElementRef, Renderer2, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CallserviceService } from '../services/callservice.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-buynow',
  templateUrl: './buynow.component.html',
  styleUrls: ['./buynow.component.css'],
  providers: [CallserviceService]
})
export class BuynowComponent implements OnInit, OnDestroy {
  cartItems: any[] = [];
  totalCost: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 25;
  intervalId: any;
  quantity: number[] = [];
  productId: number[] = [];
  userId: any;
  userDetail: any;
  title: any;

  formData: FormGroup;
  isSubmitting: boolean = false; // เพิ่มตัวแปร isSubmitting

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private elRef: ElementRef,
    private formBuilder: FormBuilder,
    private callService: CallserviceService,
    private activated: ActivatedRoute
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { cartItems: any[], totalCost: number };
    if (state) {
      this.cartItems = state.cartItems || [];
      this.totalCost = state.totalCost || 0;
      this.cartItems = this.cartItems.map(item => ({
        ...item,
        imageUrl: this.sanitizer.bypassSecurityTrustUrl(item.imageUrl.changingThisBreaksApplicationSecurity)
      }));
    }

    this.formData = this.formBuilder.group({
      userId: '',
      productId: [],
      quantity: [],
      address: '',
      province: '',
      zipcode: '',
    });
  }

  ngOnInit(): void {
    this.startCountdown();
    this.addEventListeners();
    this.userId = this.activated.snapshot.paramMap.get("userId");
    if (this.userId) {
      this.callService.getByUserId(this.userId).subscribe(res => {
        if (res.data) {
          this.title = "Your Profile User";
          this.userDetail = res.data;
          this.formData.patchValue({
            userId: this.userDetail.userId
          });
        }
      });
    } else {
      let userDetailSession: any = sessionStorage.getItem("userDetail");
      if (userDetailSession) {
        this.userDetail = JSON.parse(userDetailSession);
        this.formData.patchValue({
          userId: this.userDetail.userId
        });
        console.log("User ID:", this.userDetail.userId);
      } else {
        // Handle case where userDetail is not found in sessionStorage
      }
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  addEventListeners() {
    const confirmButton = this.elRef.nativeElement.querySelector('.btn.btn-success.btn-blocklg');
    if (confirmButton) {
      this.renderer.listen(confirmButton, 'click', () => {
        this.onSubmit();
      });
    }
  }

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.calculateTotalCost();
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  increaseQuantity(productId: number) {
    const item = this.cartItems.find(item => item.productId === productId);
    if (item) {
      item.quantity += 1;
      this.calculateTotalCost();
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    }
  }

  decreaseQuantity(productId: number) {
    const item = this.cartItems.find(item => item.productId === productId);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      this.calculateTotalCost();
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    } else if (item && item.quantity === 1) {
      this.removeFromCart(productId);
    }
  }

  calculateTotalCost() {
    this.totalCost = this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return; // ป้องกันการกดปุ่มซ้ำ
    }
    this.isSubmitting = true; // ตั้งค่าสถานะว่ากำลังส่งข้อมูล

    this.quantity = this.cartItems.map(item => item.quantity);
    this.formData.patchValue({ quantity: this.quantity });
    this.formData.patchValue({
      productId: this.cartItems.map(item => item.productId)
    });

    // Submit formData to backend
    this.callService.saveorder(this.formData.value)
      .subscribe(
        response => {
          console.log('Saved successfully:', response);
          Swal.fire({
            icon: 'success',
            title: 'การสั่งซื้อสำเร็จ!',
            text: 'ขอบคุณที่ใช้บริการ',
            confirmButtonText: 'ตกลง'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/home']);
            }
          });
          this.isSubmitting = false; // ตั้งค่าสถานะว่าการส่งข้อมูลเสร็จสิ้น
        },
        error => {
          console.error('Failed to save order:', error);
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: 'ไม่สามารถทำรายการได้ในขณะนี้',
            confirmButtonText: 'ตกลง'
          });
          this.isSubmitting = false; // ตั้งค่าสถานะว่าการส่งข้อมูลเสร็จสิ้น
        }
      );
  }

  startCountdown() {
    this.intervalId = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
      } else {
        if (this.minutes > 0) {
          this.minutes--;
          this.seconds = 59;
        } else {
          if (this.hours > 0) {
            this.hours--;
            this.minutes = 59;
            this.seconds = 59;
          } else {
            clearInterval(this.intervalId);
          }
        }
      }
    }, 1000);
  }
}
