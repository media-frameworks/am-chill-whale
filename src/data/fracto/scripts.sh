aws s3 ls s3://mikehallstudio/fracto/orbitals/00/ --recursive |grep _256 | awk '{print $4}' >fracto_00_img.txt
aws s3 ls s3://mikehallstudio/fracto/orbitals/01/ --recursive |grep _256 | awk '{print $4}' >fracto_01_img.txt
cat fracto_00_img.txt | awk '{ print length, $0 }' | sort -n -s | cut -d" " -f2- >fracto_00_img_sorted.txt
cat fracto_01_img.txt | awk '{ print length, $0 }' | sort -n -s | cut -d" " -f2- >fracto_01_img_sorted.txt
