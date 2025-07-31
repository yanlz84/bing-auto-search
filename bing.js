// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.202
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
var default_search_words = ["二十届四中全会将于10月在北京召开", "海啸抵达夏威夷 城镇街道被淹没", "俄堪察加半岛8.7级强震后火山喷发", "六预警齐发！出行注意", "乘警给穿吊带女乘客发提示卡", "朱孝天：台湾就是一个省", "净网2025：防汛抗灾不容谣言添乱", "新人领证时收到民政局1500元奖励", "广东灭蚊next level：放蚊子吃蚊子", "金龟子又要当姥姥了", "女子婚后一年发现丈夫隐瞒艾滋病史", "中国已全面将辅助生殖纳入医保报销", "堪察加半岛近海再次发生强震", "李嘉诚家族甩货大湾区400套房源", "日本女子躲海啸驾车从30米悬崖坠亡", "女子选中88888车牌卖280万？当地回应", "人社局回应公司招聘35岁以上勿扰", "北京暴雨是千年一遇还是未来常态", "向太：向佐是大小孩郭碧婷管三个孩子", "90后追不动“漂亮饭”了", "大学生为200元返现背上16万元债务", "俄此次地震引发海啸为何波及那么广", "福建舰电磁弹射歼-15T", "酒店洗浴间暗藏摄像头？警方回应", "夏威夷为何要空投数万只蚊子", "旺仔小乔是张碧晨最大的黑粉吧", "韩驻中美日俄大使首次同时空缺", "77岁老人一次性拔12颗牙种6颗后身亡", "女子每天穿束身衣23小时致内脏移位", "解放军新型潜艇远航画面首次曝光", "26岁女生患胃癌：疑因幽门螺旋杆菌", "湖南回应脱贫县121万改建中学校门", "女子称取快递被收公共资源占用费", "30岁老将徐嘉余累到扶腰", "释小龙原来是王宝强师叔", "美企高管访华 排队同中方握手", "佛山启动突发公共卫生事件Ⅲ级响应", "本田雅阁终端价下探至13万级", "特朗普将对韩征收15%关税", "广西信访局局长任上被查", "65位勇士徒步挺进“孤岛”冯家峪", "中国游泳4×100混接夺得银牌", "电影《南京照相馆》计划海外上映", "安徽一高校连续三年手写录取通知书", "欧阳夏丹回复网友如何养老", "印度议员呼吁集结全部阵风战机阅兵", "网友用热成像特效抓蚊子", "24岁女游客漂流遇暴雨失联已超3天", "吉林发布山洪灾害气象风险红色预警", "乘龙卡车回应对撞试验", "河北承德7个失联村全部恢复联系"]

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
