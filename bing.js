// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.363
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
var default_search_words = ["总书记的瞩望已然落地生根", "停运！暴雪！断崖式降温！", "一年级孩子遭遇“开学最大打击”", "绘就“一老一小”幸福图景", "“告诉爸爸 妈妈很快就回来了”", "蒙面人持械抢劫！卢浮宫多件藏品被盗", "护网：网警侦破非法控制计算机系统案", "卢浮宫一件被盗珠宝掉半路了", "全美700万人涌上街头抗议特朗普", "夫妻自驾到内蒙捡蔬菜：捡了约500斤", "杨振宁学生：老师在平静安详中离开", "梭子蟹里都是寄生虫不能吃系谣言", "郑丽文支持者激动落泪：我是中国人", "果冻里的“蒟蒻”到底是什么", "让员工退还3年过节费？银行回应", "全球媒体悼念杨振宁", "卢浮宫9件拿破仑时期珠宝被盗", "卢浮宫持械抢劫事件作案细节曝光", "被“空中三蹦子”帅到了", "晋A99999劳斯莱斯180万成功拍卖", "卢浮宫被盗过程仅7分钟", "揭秘美国对中国发动的“时间战”", "全国各地最低工资标准情况公布", "350斤吃播网红切胃减肥", "未来3天冷冷冷冷冷", "马克龙全程跟进卢浮宫被盗案调查", "西安城墙变成巨型生态缸", "美方网攻中国授时中心细节公布", "金价涨了 印度人节日买金习惯变了", "周杰伦新歌和霉霉撞灵感", "苏超半决赛：南通vs无锡", "丈夫隐瞒艾滋病10年夫妻生活无防护", "山西大同惊现乌鸦满天盘旋", "又一个“国家级都市圈”获批", "74岁“肥猫”郑则仕回应去世传闻", "为什么年轻人迷上了爬山", "《没出息》盗窃版来了", "国航公布机舱锂电池自燃赔偿方案", "男子买牛养出感情不舍得用牛干农活", "实探安世半导体东莞工厂：原材料告急", "乘客被困高铁厕所10分钟 12306回应", "《沉默的荣耀》带火吴石故居", "金价狂飙 “租三金”结婚成新选择", "美防长见泽连斯基时戴俄国旗色领带", "原来下车真的可以连滚带爬", "北京大学发文悼念杨振宁", "尾号8888888手机号拍出127万余元", "俄大型天然气加工厂遭袭", "男子夜遇野生东北虎 大喊“本地的”", "以色列对加沙南部拉法地区发动袭击", "中国地下工程装备研制有重大突破"]

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
