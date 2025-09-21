// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.306
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
var default_search_words = ["中美完全可以相互成就、共同繁荣", "蔡国强始祖鸟发布致歉信", "菲将举行大规模游行 中使馆发提醒", "近距离感受“大国重器”", "始祖鸟烟花秀引争议 日喀则通报", "中小学春秋假还没推广 难在哪", "特朗普：我们在乌克兰战争中赚钱了", "湖南资产上亿女老板疑被骗去泰国", "60后大一新生称可请妻子开家长会", "涉嫌严重违纪违法 张权被查", "加沙已变“死城”", "官方辟谣“深圳核心区放开限购”", "暴雨中台下只剩1名观众 演员仍开演", "蔡国强被誉为“中国烟花第一人”", "女子婚后起诉父母返还18万彩礼", "专家：高山草甸恢复需几十甚至上百年", "俄士兵看自己与乌士兵肉搏影像落泪", "金价飙升 有非法淘金人井下生活两年", "委内瑞拉：美国“不宣而战”", "乌称遭俄580架无人机40枚导弹袭击", "特朗普升级办公室：肉眼可见全是黄金", "卡塔尔正式投诉以色列：违反国际公约", "穿始祖鸟是为亲近自然而非看它炸山", "火龙果“熬夜”会更甜", "海浪你见过 但“旗浪”你见过吗", "坠落广东的火流星被挖出 重423公斤", "网红“户晨风”多平台账号被封", "试管婴儿患肾病 父母要求医院担全责", "女飞行员回应2岁萌娃表白", "澳大利亚紧急呼叫服务中断致4死", "塞尔维亚举行“团结的力量”阅兵式", "小区停水后用吸污车供水？当地回应", "少将王志龙已任空军装备部部长", "辅导员诈骗上百人 校方是否要担责", "印度廉价酒店之王估值570亿元", "联合国秘书长对苏丹局势深表关切", "俄称恢复对伊制裁会致紧张局势升级", "台网红盛赞贵州“超越想象”", "印空军参谋长：我们给世界上了一课", "哈里斯回顾败选 不满拜登和同僚", "镇长组织聚餐酒后打人被撤职降级", "美国防部被曝暂停部分对欧洲军售", "女童20楼坠至13楼雨棚 被业主拽住", "台海军前舰长吕礼诗参加长春航展", "国产柔性OLED手机屏占比已超六成", "刘一菲承认蹭刘亦菲流量", "山西前8个月抽采煤层气近百亿立方米", "民政部领导有调整", "一文读懂第11批集采新规则", "猴子下山“造访”贵州大学一宿舍", "广东阳山一货车撞上公交车后侧翻"]

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
