function initData() {
    if (!localStorage.getItem('dsXeTrongBai')) {
        const defaultXe = [
            { id: 1, bienSo: '29A-123.45', loaiXe: 'Xe máy', timeIn: '18/10/2026 - 08:30' },
            { id: 2, bienSo: '30F-987.65', loaiXe: 'Ô tô', timeIn: '18/10/2026 - 09:15' }
        ];
        localStorage.setItem('dsXeTrongBai', JSON.stringify(defaultXe));
    }

    if (!localStorage.getItem('lichSuXe')) {
        localStorage.setItem('lichSuXe', JSON.stringify([]));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initData();


    if (document.getElementById('table-xe-trong-bai')) {
        renderIndexPage();
    }

    // 2. XỬ LÝ TRANG XE-VAO.HTML (Form nhận xe)
    const formNhanXe = document.getElementById('form-nhan-xe');
    if (formNhanXe) {
        formNhanXe.addEventListener('submit', (e) => {
            e.preventDefault();
            const bienSo = document.getElementById('input-bien-so').value.trim().toUpperCase();
            const loaiXe = document.getElementById('select-loai-xe').value;

            let dsXe = JSON.parse(localStorage.getItem('dsXeTrongBai')) || [];


            if (dsXe.some(x => x.bienSo === bienSo)) {
                alert('LỖI: Biển số xe này hiện đã có trong bãi!');
                return;
            }

            const now = new Date();
            const timeIn = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const xeMoi = { id: Date.now(), bienSo, loaiXe, timeIn };
            dsXe.push(xeMoi);
            localStorage.setItem('dsXeTrongBai', JSON.stringify(dsXe));

            alert(`Nhận xe ${bienSo} vào bãi thành công!`);
            window.location.href = 'index.html';
        });
    }


    if (document.getElementById('table-history')) {
        renderThongKePage();
    }
});


function renderIndexPage() {
    let dsXe = JSON.parse(localStorage.getItem('dsXeTrongBai')) || [];


    document.getElementById('count-total').innerText = `${dsXe.length} chiếc`;
    document.getElementById('count-motor').innerText = `${dsXe.filter(x => x.loaiXe === 'Xe máy').length} chiếc`;
    document.getElementById('count-car').innerText = `${dsXe.filter(x => x.loaiXe === 'Ô tô').length} chiếc`;

    const tbody = document.getElementById('table-xe-trong-bai');
    if (dsXe.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Bãi xe hiện đang trống</td></tr>`;
        return;
    }

    tbody.innerHTML = dsXe.map((xe, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><b>${xe.bienSo}</b></td>
            <td>${xe.loaiXe}</td>
            <td>${xe.timeIn}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="choXeRa(${xe.id})">Cho xe ra</button>
            </td>
        </tr>
    `).join('');
}


function choXeRa(id) {
    let dsXe = JSON.parse(localStorage.getItem('dsXeTrongBai')) || [];
    let lichSu = JSON.parse(localStorage.getItem('lichSuXe')) || [];

    const xeRa = dsXe.find(x => x.id === id);
    if (!xeRa) return;

    // Tính tiền theo loại xe
    let giaTien = 5000;
    if (xeRa.loaiXe === 'Ô tô') giaTien = 30000;
    if (xeRa.loaiXe === 'Xe đạp') giaTien = 3000;

    const now = new Date();
    const timeOut = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (confirm(`Xác nhận cho xe ${xeRa.bienSo} ra bãi?\nSố tiền thu: ${giaTien.toLocaleString('vi-VN')} VNĐ`)) {

        dsXe = dsXe.filter(x => x.id !== id);
        localStorage.setItem('dsXeTrongBai', JSON.stringify(dsXe));


        lichSu.push({
            id: Date.now(),
            bienSo: xeRa.bienSo,
            loaiXe: xeRa.loaiXe,
            timeIn: xeRa.timeIn,
            timeOut: timeOut,
            tienThu: giaTien
        });
        localStorage.setItem('lichSuXe', JSON.stringify(lichSu));


        renderIndexPage();
    }
}


function renderThongKePage() {
    let lichSu = JSON.parse(localStorage.getItem('lichSuXe')) || [];
    let dsXe = JSON.parse(localStorage.getItem('dsXeTrongBai')) || [];

    const tongDoanhThu = lichSu.reduce((sum, item) => sum + item.tienThu, 0);

    document.getElementById('stat-revenue').innerText = `${tongDoanhThu.toLocaleString('vi-VN')} VNĐ`;
    document.getElementById('stat-turns').innerText = `${dsXe.length + lichSu.length} lượt`;
    document.getElementById('stat-completed').innerText = `${lichSu.length} xe`;

    const tbody = document.getElementById('table-history');
    if (lichSu.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Chưa có lịch sử xe ra bãi</td></tr>`;
        return;
    }

    tbody.innerHTML = lichSu.slice().reverse().map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><b>${item.bienSo}</b></td>
            <td>${item.loaiXe}</td>
            <td>${item.timeIn}</td>
            <td>${item.timeOut}</td>
            <td><span class="text-success fw-bold">${item.tienThu.toLocaleString('vi-VN')} đ</span></td>
        </tr>
    `).join('');
}
