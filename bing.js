// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.190
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
var default_search_words = ["中欧领导人要作正确战略抉择", "富豪CEO被大象踩踏身亡", "男子6结6离 5任前妻都是债主", "基孔肯雅热 到底怎么防", "溺亡事故获救老师照片公布 未截肢", "《年轮》原唱到底该归谁", "李佳琦承诺赔付铂爵旅拍订单", "“A股或正站在全面牛市的起点上”", "上海街头真无人出租车要来了", "“专治不服”的河南队回来了", "中国周边又一场激烈冲突开始了", "基孔肯雅热出现人传人？假", "哈萨克斯坦女网红为恶搞中国人道歉", "BOSS直聘再被曝“色情招聘”", "一起车祸“撞碎”四个家庭", "8旬独居老太深夜持菜刀砍邻居门", "5年前扶贫小组欠万元餐费仍未结清", "溺亡学生出事前给朋友发格栅板视频", "TVB前当家花旦一家三口国外旅行", "普京为俄客机失事遇难者默哀", "俄失事客机坠毁前舱内画面曝光", "674分被福耀科技大学录取 本人回应", "泰国卫生部：泰柬冲突致泰国14人死亡", "福耀科技大学多位院长亮相", "30年老小区“长出”共享花园", "40多岁啃老男要钱被拒 往楼下扔菜刀", "内蒙古调查组进驻学生溺亡事故现场", "溺亡学生家属：他是村里第一个大学生", "美军炫耀“无人机扔手雷”被群嘲", "iOS 26公测版发布：上线液态玻璃效果", "“牛头萨满”与特朗普决裂", "涉事浮选槽不存在强酸强碱和高温", "台风“吹”来的海鲜能吃吗", "马克龙：法国将承认巴勒斯坦人建国", "中国9地获“国际湿地城市”认证", "“星链”网络中断2.5小时", "中金黄金市值蒸发34亿 子公司曾被罚", "内蒙古成立“7·23”事故调查组", "帮扶人员吃饭打白条 老板讨要未果", "法国总统马克龙起诉一名美国网红", "谁为脆弱的格栅板负责", "汪苏泷方决定收回《年轮》授权", "“卷价格”转向“优价值”才是正道", "全国首次无人机紧随台风抵近侦察", "特朗普和鲍威尔面对面争论翻修成本", "巴方对法国承认巴勒斯坦国表示感谢", "特朗普到访美联储 称谈话很有成效", "在上海体验无人驾驶出租车", "印度对华签证的门槛还是太高了", "波兰正式退出《渥太华禁雷公约》", "美法官再延波音737MAX空难案听证会"]

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
