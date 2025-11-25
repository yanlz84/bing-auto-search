// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.437
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
var default_search_words = ["习近平同特朗普通电话", "损失惨重！日本酒店经营者称万分委屈", "儿科已出现甲流危重症", "神舟二十二号飞船发射圆满成功", "充电宝3C认证将全面失效", "六大行均已下架五年期大额存单", "净网：网警揭露直播间“托儿”真面目", "新加坡为何敢对中日争端指手画脚", "警惕！日本或成为亚洲最危险的国家", "流感高发有医院患者排到1200多号", "男装店用烟灰缸做吊牌后退货减少", "无人快递车“吵架”系谣言", "老人偷偷剃光孩子胎发 宝妈崩溃大哭", "在日中国游客提前回国 机场仿佛春运", "陈百祥：中国一讲琉球独立日本就脚软", "中国大米出现在日本商店显著位置", "明年起遛狗不拴绳违法", "日本九州岛发生5.3级地震", "“冷美人”3个月拿了41667元奖金", "一甲骨文字形因像“洗头”走红", "新华社：日本已经站在危险的悬崖边", "曝林俊杰女友疑似是网红七七", "外交部：中美元首通话是美方发起的", "韩国发布严重级危机警报 发生了啥", "华为Mate80系列价格公布 4699元起售", "17岁少年坠楼轻生 生前疑遭校园欺凌", "神舟二十二号与空间站完成对接", "华为非凡大师手表售价24999元", "卫生院挂“把病人留住是艺术”标语", "外交部回应美日领导人通话", "日本为何对台湾念念不忘", "61岁网红突然去世 师弟否认喝酒导致", "当地民政局回应领结婚证发1千5奖金", "广东一高校请6万师生吃牛扒", "成本20元的表皮生长因子售价上万", "男子离家前跪别空无一人老家", "外交部：日方企图蒙混过关", "中方暂停日本电影在华上映审批", "流感高发 3招为你保驾护航", "中国麻辣串在首尔“人气爆发”", "原唱回应《大东北我的家乡》翻红", "日本民众再于首相官邸前集会抗议", "烟花爆竹强制性国标明年5月实施", "#流感病毒越来越强了吗#", "巴基斯坦空袭阿富汗造成10死4伤", "日方刻意回避中方收回错误言论要求", "四川拟禁止或限制在公共场所吸烟", "联合国：巴勒斯坦被占领土陷经济崩溃", "国开行提醒防范的“人民资产”是啥", "上海地铁试点“站票车厢”引热议", "为摆脱家暴实施伤害杀害视情节从宽"]

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
