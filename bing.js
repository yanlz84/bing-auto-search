// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.142
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
var default_search_words = ["总书记讲给共产党员的6个故事", "多人因微信办公违规被处理", "上海飞东京航班故障 高空速降7000米", "赓续光荣传统 谱写时代华章", "区委书记请客下馆子 人均花费50元", "金价大跌 商家称不如上涨时卖得好", "党的旗帜所指 即是网警铁翼所向", "新房地下挖出尸骨 住建局介入协调", "重温1997年7月1日0时0分0秒", "爸爸用霍氏八极拳铁山靠帮孩子摘杏", "美主播污蔑中国 特朗普：我们也做过", "睡觉时开风扇比空调更健康？辟谣", "原银行董事长400万迈凯伦89万被拍下", "马斯克暗指美国共和党为“猪党”", "上海飞东京航班紧急降落 官方通报", "21岁女模陈尸酒店 中国籍男子自首", "美参议院花16小时宣读大而美法案", "驱赶给婴儿喂奶游客 上海动物园道歉", "刘诗雯拟被浙江大学录取为博士", "人民日报专访刘宇宁", "《哪吒2》全球票房破159亿", "女子拍到野牛跌入温泉被“煮”死", "客机高空急坠亲历者：给老公写了遗书", "天问二号在轨获取的地月影像图发布", "动物园被举报个人码收门票费上千万", "加拿大取消数字服务税", "郑钦文温网首轮比赛延期进行", "特朗普签署行政令结束对叙利亚制裁", "泰国纸厂火灾已致至少8人死亡", "女子遇已故同学父亲摆摊：买下所有瓜", "泄露工作秘密 “内鬼”申勇被双开", "《射雕英雄传》上半年武侠片票房冠军", "曝哈佛大学与白宫谈判陷入僵局", "纳指标普500指数创收盘历史新高", "安徽省民政厅原副厅长高光权被双开", "美军披露：特工潜伏伊朗核设施15年", "德国6月通胀率回落至2.0%", "美联储博斯蒂克：今年会降息一次", "河南一地明确禁止“老头乐”上路", "波兰拟恢复与两国的边境管控", "丹麦接任欧盟轮值主席国", "新房院中挖出尸骨开发商是否需担责", "葡萄牙创下6月高温新纪录", "林俊杰回复马龙感谢其演唱会大合唱", "专骗老年人 净水器骗局曝光", "特朗普对日本强硬表态", "伊武装部队：准备应对任何新侵略行为", "土总统：安卡拉将承办2026年北约峰会", "单套2亿起的上海豪宅开盘", "高校引进高层次人才 第2名举报第1名", "男子海边溺水 女孩挺身而出挽救生命"]

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
