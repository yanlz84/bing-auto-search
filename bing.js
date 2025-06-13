// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.106
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
var default_search_words = ["旧物换新 万亿市场添“活力”", "以色列对伊朗发动袭击", "幸存者跳机逃生 自行从残骸中走出", "中国外贸在复杂环境中稳健前行", "印坠机幸存者：站起来时周围都是尸体", "以色列全国进入紧急状态", "印航母公司为每名死者赔1000万卢比", "遭印客机撞击大楼内景：桌上还有饭菜", "金晨赛车故障无缘比赛痛哭", "印度坠机事故致超290人死亡", "小沈阳女儿出道照撞脸韩演员孔孝真", "重庆一车库有尸臭味？谣言", "实习医生举报腐败后身亡 警方介入", "印坠机幸存者：起飞30秒一声巨响", "王晓晨回应与俞灏明已婚传闻：头昏了", "以色列宣布关闭领空", "牛弹琴：反华“三角恋”搞不下去了", "台网红“馆长”在上海与汪小菲约饭", "印空难幸存者座位11A 紧邻舱门", "黑匣子显示印度坠机未能正常起飞", "金正恩致贺电祝普京身体健康", "特朗普暴露了三大缺陷", "波音称愿全力配合印度坠机事故调查", "特朗普看了一出大戏", "印度失事客机乘客国籍公布", "印度坠机已致地面多人死亡", "印度坠毁客机起飞时呈失速状态", "印度客机坠毁是波音787首起空难", "幸存者跳出紧急出口 边走边聊天", "章泽天何超莲同框 好养眼", "刘诗诗压轴出场 妥妥的红毯定海神针", "坠毁客机乘客登机前发视频：再见印度", "江西宜春通报保安非法拘禁2名未成年", "打虎！国家铁路局局长费东斌被查", "越南正式撤销29个省", "印航坠毁机型曾被“吹哨人”曝光", "现货黄金涨超0.9% 一度逼近3400美元", "靳东走红毯像是领导来开会", "前民航机长：飞机拉起就坠毁太罕见", "并购重组市场持续升温", "章子怡夸赵丽颖短发帅气西林", "B站崩了", "特斯拉起诉前Optimus机器人工程师", "邓超一家外出 等等一瘸一拐疑似受伤", "印度客机机场坠毁 多人送医画面曝光", "公司高管爽约式增持 赔偿股民80万", "挑扁担回家女孩校长回应张雪峰", "台风“蝴蝶”已加强为强热带风暴级", "IAEA称伊朗违反核不扩散条约义务", "印度坠毁客机黑匣子已找到", "媒体称国足再弱也轮不到业余队挑战"]

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
