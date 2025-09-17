// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.298
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
var default_search_words = ["总书记部署全国统一大市场建设", "地球臭氧层正在恢复意味着什么", "12306回应国庆开票即候补", "杨靖宇之孙拿出一块“传家宝”", "今起连续3天有三场重要发布会", "普京身着军装出席俄白联合军演", "鹿晗零点没祝关晓彤生日快乐", "货车司机弄丢13块银砖 每块悬赏2万", "甘肃高校回应疑有女生校内分娩", "小伙7万5抵押14万新车赎回要13万多", "美股收盘：百度大涨超7%", "“成都自缢女子为外卖骑手”不实", "女童洗澡被哥哥用打火机零件电伤", "出生237天的他成为了“大体老师”", "清华学霸晒1.67亿年薪 美方称其在逃", "雷佳音透露和孙艺洲是同班同学", "刘强东喊话王兴：企业家不应成仇人", "多名穿病号服老人医院门前干活", "20款水牛乳产品无一款原料达100%", "以方首次披露：曾在伊朗部署百名特工", "包书皮变成“家长作业”合理吗", "中国页岩气试产最高纪录刷新！", "雨雨雨！10余省区市局地有大到暴雨", "以军双线作战 内塔尼亚胡想赌一把？", "12306回应卧铺乘客打伞遮隐私", "旧礼盒装新月饼违规吗", "人类首次“看见”的黑洞 身份照上新", "中天小姐姐要来上海了", "5岁女童被废弃电线杆砸中身亡", "老人将无糖饮料当水喝 患糖尿病酮症", "中方强烈谴责以色列袭击卡塔尔", "儿女非亲生男子一审获赔10.9万", "“美国发现自己落后了”", "网友称胖东来酥饼10号揽收11号生产", "特朗普到访英国引发民众抗议", "李幼斌回应《亮剑》热播20年", "向太称曾借刘德华4000万 还没打欠条", "日本拒绝美国对中国和印度加征关税", "警方通报男子在酒店趴地偷窥", "柯克案嫌犯首次出庭：全程面无表情", "内蒙古两民警浴血制伏持刀嫌疑人", "安踏通报一总裁级人员涉嫌违法", "四川一小区“土味区块链”火了", "和平鸽飞上天安门广场国庆大花篮", "小鹏汇天回应长春事故：现场人员安全", "西方主要车企利润暴跌", "法国强烈谴责以色列攻入加沙城", "著名电影人罗伯特雷德福去世", "波兰提议北约在乌克兰设禁飞区", "应对小行星威胁 中国有主动防御方案", "这群人为啥要背着国徽进山？"]

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
