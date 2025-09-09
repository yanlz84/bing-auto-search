// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.283
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平会见葡萄牙总理蒙特内格罗", "全球首款“骨胶水”在浙江研发成功", "娃哈哈瓶盖印形似公章引热议", "98岁的他把教鞭送给年轻教师", "无人机和马蜂上演空中大战", "92岁游本昌回应入住养老院", "九寨沟一酒店出现毒蛇 孩子还上手摸", "迪奥因数据泄露被公安网安部门处罚", "信用卡“退潮”：三年蒸发9200万张", "无语哥落地北京开口说话了", "国产九价HPV疫苗开打 每支定价499元", "“宁夏多名学生食物中毒”系谣言", "OPPO“最美产品经理”Monica离职", "黄景瑜前妻喊话许凯 暗示有前夫的瓜", "已婚教师自称出轨女学生？教育局回应", "iPhone 17配置大曝光 性价比如何", "你可能不认识我 但一定用过我表情包", "互联网灾星李炮儿的含金量还在上升", "法国总理贝鲁递交辞呈", "iPhone17或成国内首款无卡槽手机", "文心大模型X1.1正式发布", "男子白酒当水喝确诊胃癌3周离世", "中国银行原副行长林景臻被查", "24岁女孩愿免费打工20年救母亲", "LABUBU：追我的人从这里排到了俄国", "以军首次发出“全城撤离令”", "夫妻合租房生娃被赶 应该搬走吗", "中国舞协2名厅官双双被公诉", "尼泊尔总理奥利辞职", "苹果发布会前瞻：最大看点iPhone Air", "青岛一环卫工将垃圾扫进大海被开除", "美国知名资管巨头大举加仓中国股票", "石破茂宣布辞职后首晒照：笑容洋溢", "21岁女生确诊白血病4个多月后离世", "#被中方制裁的石平到底干了啥#", "柬埔寨拟采购20架C909客机", "铁锅炖老板回应跳水救人：不能不救", "男子在30多家店租大疆后抵押出售", "男子梦中搏斗误伤身旁妻子", "6省国补资金被骗及违规使用过亿", "女子用激光笔逗猫烧坏自己眼睛", "德国柏林大范围停电 疑为蓄意破坏", "泽连斯基提出解决冲突新建议", "父亲为和女儿联系生活费每月分4次给", "iPhone 17系列售价预测：Pro版要涨价", "女子术后纱布留体内11年致九级伤残", "女子食用自制生腌蟹脓毒性休克", "中国约7亿人感染幽门螺旋杆菌", "16岁女高中生离校失联 警方正搜寻", "他信须重新服刑1年", "曝当红小生牌场情场双翻车"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
