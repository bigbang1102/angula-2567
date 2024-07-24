import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { CallserviceService } from '../services/callservice.service';

@Component({
  selector: 'app-dashbordAdmin',
  templateUrl: './dashbordAdmin.component.html',
  styleUrls: ['./dashbordAdmin.component.css']
})
export class DashbordAdminComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private callService: CallserviceService,
    private router: Router,
    private activated: ActivatedRoute,
  ) { }

  userDetail: any;
  roleList: any;
  userId: any;
  title: any;
  user: any;
  imgUser: any;
  idImg: any
  fileimg: any;
  updateForm: FormGroup = this.formBuilder.group({
    fristName: '',
    lastName: '',
    phone: '',
    age: '',
    roleId: '',
    userName: ''
  });

  ngOnInit() {
    this.getAllRole();

    this.userId = this.activated.snapshot.paramMap.get("userId");
    console.log('kkk', this.userId)

    if (this.userId) {
      this.callService.getByUserId(this.userId).subscribe(res => {
        if (res.data) {
          this.title = "Your Profile User";
          this.userDetail = res.data;
          this.setDataForm(this.userDetail);
        }
      });
    } else {
      this.title = "Your Profile Login";
      let userDetailSession: any = sessionStorage.getItem("userDetail");
      this.userDetail = JSON.parse(userDetailSession);
      this.setDataForm(this.userDetail);
      this.getData(this.userDetail.userId);
    }
    console.log('jjj', this.userDetail)
    this.callService.userImage(this.userDetail.userId).subscribe(res => {
      if (res.data) {
        console.log(res)
        this.imgUser = res.data.img;
        this.idImg = res.data.id
      }
    });
  }

  setDataForm(data: any) {
    this.updateForm.patchValue({
      fristName: data.fristName,
      lastName: data.lastName,
      phone: data.phone,
      age: data.age,
      roleId: data.roleId,
      userName: data.userName,
    });
  }

  setProfileForm = this.formBuilder.group({
    Img: '',
    userId: ''
  })

  getData(userId: any) {
    this.callService.getByUserId(userId).subscribe(res => {
      if (res) {
        this.user = res.data;
      }
    });
  }

  getAllRole() {
    this.callService.getAllRole().subscribe(res => {
      if (res) {
        this.roleList = res;
      }
    });
  }

  onSubmit() {
    Swal.fire({
      title: 'คุณต้องการแก้ไขข้อมูลใช่หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก'
    })
    const data = this.updateForm.value;

    this.callService.updateProfile(data, this.userDetail.userId).subscribe(res => {
      if (res.data) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'แก้ไขข้อมูลสำเร็จ',
          confirmButtonText: 'ตกลง',
        });

        if (this.userId) {
          this.router.navigate(['/profile/' + this.userId]);
        } else {
          this.getUserById(res.data);
          this.router.navigate(['/profile']);
        }
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

  getUserById(userId: any) {
    this.callService.getByUserId(userId).subscribe(res => {
      if (res.data) {
        this.setDataForm(res.data);
        sessionStorage.removeItem("userDetail");
        sessionStorage.setItem("userDetail", JSON.stringify(res.data));
      }
    });
  }

  onChangePictureClick() {
    document.getElementById('fileInput')!.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.fileimg = file
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imgUser = e.target.result.split(',')[1];
        Swal.fire({
          icon: 'question',
          title: 'Are your sure for update?',
          showConfirmButton: true,
          showCancelButton: true
        }).then((result) => {
          if (result.isConfirmed) {
            const data = new FormData();
            data.append('Img', this.fileimg as any);
            data.append('userId', this.userDetail.userId as any);
            console.log("this.userDetail.userId", this.userDetail.userId)
            this.callService.updateProfileAvatar(data, this.userDetail.userId).subscribe(res => {
              if (res) {
                Swal.fire({
                  icon: 'success',
                  title: 'สำเร็จ!',
                  text: 'อัปเดตรูปโปรไฟล์สำเร็จ',
                  confirmButtonText: 'ตกลง',
                });
              }
            });
          }
        })

      };
      reader.readAsDataURL(file);
    }
  }
}
