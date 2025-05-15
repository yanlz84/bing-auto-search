// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.48
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
var default_search_words = ["推动中哥战略伙伴关系走深走实", "郑钦文创历史 生涯首胜萨巴伦卡", "美国调整对华加征关税", "外国人眼中的中国经济韧性", "娃哈哈纯净水由今麦郎代工？客服回应", "特朗普为何让步？美媒揭露真相", "李亚鹏妻子自曝没钱 从大平层换小房", "律所招聘 要求本科生游戏段位达王者", "印度又断水：大坝关闭 下游河床裸露", "曝曾犯强奸罪的教师出狱后开办教培", "杨天真瘦成不穿大码女装的样子了", "5岁男童被拐家属悬赏50万？假", "外交部回应印度：改名是主权范围内", "多名在英国中国公民失踪失联", "普京确定俄乌谈判俄方代表团名单", "1万亿资金来了 降准正式落地", "印议员嘲讽莫迪：阵风坠落像受伤小鸟", "林志炫：不是直播我不会回《歌手》", "法拉利CEO谈车载屏：开车不是看电视", "外交部：中方对美芬太尼反制仍然有效", "关晓彤左手无名指戴戒指", "赵丽颖新恋情曝光", "美国客户“砸单” 义乌工厂加急发货", "普京：有些西方企业光道歉可不够", "金价大跌 网友直呼“亏麻了”", "女子称穿瑜伽服上门做饭不是为流量", "美F-35战机险被胡塞武装导弹击中", "人民日报点评《人生若如初见》", "俄乌直接谈判有望重启 谁参加谈什么", "郑钦文谈击败萨巴伦卡心得", "英退伍军人揭露英军在中东非法杀戮", "台女子日本温泉拍照致其他女性入镜", "台军头子面对质疑又语无伦次", "普京特朗普均不参加俄乌会谈", "特朗普提统一 台退将：台湾就是棋子", "中央巡视组进驻后 童亚辉主动投案", "甄嬛生日 邓超：啥蛋糕能插319根蜡烛", "郑钦文一战刷新三大纪录", "藿香正气水在国外立大功", "AC米兰爆冷丢杯遭双重打击", "中国打造2800颗算力卫星天基算力网", "网红千惠回应戛纳红毯穿大裙摆礼服", "陈梦称乒乓球是完全不能输的", "皇马2比1马洛卡", "TTG4-2力克狼队", "刘国梁被恶意造谣 中国乒协发声", "保时捷失控致1死2伤 交警通报", "“用意念控制iPhone”有望成真", "日本餐饮公司就拒绝接待中国人道歉", "丈夫向小17岁情人转162万 妻子起诉", "泽连斯基启程前往土耳其"]

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
