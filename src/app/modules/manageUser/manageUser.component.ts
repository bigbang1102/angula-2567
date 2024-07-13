import { Component, OnInit } from '@angular/core';
import { CallserviceService } from '../services/callservice.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manageUser',
  templateUrl: './manageUser.component.html',
  styleUrls: ['./manageUser.component.css']
})
export class ManageUserComponent implements OnInit {

  constructor(
    private callService: CallserviceService,
    private router: Router,
    private formBuilder: FormBuilder,
    private activated: ActivatedRoute
  ) { }

  selectUser: any;
  userList: any;
  roleList: any;
  userId: any;
  title: any;
  userDetail: any

  updateForm = this.formBuilder.group({
    fristName: '',
    lastName: '',
    phone: '',
    age: '',
    roleId: '',
    userName: ''
  });

  ngOnInit() {
    this.getAllUsers();
    this.getAllRole();
  }

  getAllUsers() {
    this.callService.getAllUser().subscribe(res => {
      if (res.data) {
        this.userList = res.data;
        console.log(this.userList);
      }
    });
  }

  setdata(data: any) {
    console.log(data);
    this.callService.getByUserId(data).subscribe((res) => {
      if (res.data) {
        this.setDataForm(res.data);
        this.selectUser = data
        console.log(res.data)
      }
    })
  }


  setDataForm(data: any) {
    this.updateForm.patchValue({
      fristName: data.fristName,
      lastName: data.lastName,
      phone: data.phone,
      age: data.age,
      roleId: data.roleId,
      userName: data.userName,
    })
  }

  getAllRole() {
    this.callService.getAllRole().subscribe(res => {
      if (res) {
        this.roleList = res;
      }
    })
  }

  onSubmit() {
    console.log(this.updateForm.value)
    const data = this.updateForm.value
    this.callService.updateProfile(data, this.selectUser).subscribe(res => {
      console.log(res);
      if (res.data) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'สมัครสมาชิกสำเร็จ',
          confirmButtonText: 'ตกลง',
        });

        window.location.reload()

      } else {
        Swal.fire({
          icon: 'warning',
          title: 'บันทึกไม่สำเร็จ!',
          text: 'กรุณาตรวจสอบข้อมูล ด้วยค่ะ',
          confirmButtonText: 'ตกลง',
        });
      }
    })
  }
  getUserById(userId: any) {
    this.callService.getByUserId(userId).subscribe(res => {
      if (res.data) {
        this.setDataForm(res.data)
        sessionStorage.removeItem("userDetail")
        sessionStorage.setItem("userDetail", JSON.stringify(res.data))
      }
    })
  }

  onUpdateUser(userId: any) {
    if (userId) {
      this.router.navigate(['/profile/' + userId]);
    }
  }

  onDeleteUser(userId: any): void {
    if (userId) {
      Swal.fire({
        icon: 'warning',
        title: 'ต้องการลบหรือไม่',
        text: 'คุณต้องการลบใช่หรือไม่.',
        confirmButtonText: 'ตกลง',
        showCancelButton: true,
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          this.callService.deleteUserByUserId(userId).subscribe(res => {
            if (res.data) {
              Swal.fire({
                icon: 'success',
                title: 'ลบผู้ใช้สำเร็จ!',
                text: 'ผู้ใช้ถูกลบเรียบร้อยแล้ว.',
                timer: 1000
              })
              window.location.reload()
            }
          });
        }
      });

    }
  }

}
