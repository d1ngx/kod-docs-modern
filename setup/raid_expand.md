---
title: "RAID5扩容说明"
keywords: RAID, RAID5, 扩容
description: 如何将新增磁盘加入RAID5阵列
---

<div id="raid5expand" class="tab-pane fade in active" markdown="1">

> **提示**：
>
> - 在磁盘管理界面一键创建RAID阵列后，如果想要添加新的磁盘实现扩容，需要进入服务器终端执行以下操作。


扩容 RAID 5 阵列从 3 块盘到 4 块盘的步骤如下：

1. **备份数据**：在进行任何操作之前，确保所有重要数据都已备份，以防止数据丢失。

2. **检查 RAID 阵列状态**：
   ```bash
   cat /proc/mdstat  ##假设查到阵列位置是/dev/md0
   mdadm --detail /dev/md0
   ```

3. **添加新硬盘**：将新硬盘（例如 `/dev/sda`）连接到系统中。

4. **将新硬盘添加到 RAID 阵列**：
   ```bash
   mdadm --add /dev/md0 /dev/sda
   ```

5. **查看 RAID 阵列状态**：
   ```bash
   mdadm --detail /dev/md0
   ```

6. **扩展 RAID 阵列**：将 RAID 阵列从 3 块盘扩展到 4 块盘。
   ```bash
   mdadm -v --grow --raid-devices=4 /dev/md0
   ```

7. **查看 RAID 阵列状态**：
   ```bash
   cat /proc/mdstat  # 等待扩容完成，观察Array Size 会增加
   mdadm --detail /dev/md0
   ```

8. **扩展文件系统**：如果文件系统已挂载，需扩容文件系统
   ```bash
   pvs
   pvresize /dev/md0
   lvextend -l +100%FREE /dev/mapper/vgroup1-lvol1 # 扩容卷组
   xfs_growfs /kdisk/volume1   # ext4使用resize2fs /mnt/kdiskxxx
   ```
</div>
