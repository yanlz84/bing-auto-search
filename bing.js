// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.4
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
var default_search_words = ["推动中柬命运共同体建设迈出新步伐", "洛阳文旅确认白马寺内为狄仁杰墓", "美股市场已成“爆炸区”", "美国三大因素逼走国际投资者", "电商平台全面取消仅退款", "微信加好友能加图片备注了", "男子全职带娃患产后抑郁 现已离婚", "美市长提议给无家可归者发芬太尼", "饮用水一瓶卖988元 内含3颗水晶", "徐锦江因儿子离家拍戏嚎啕大哭", "神舟二十号载人飞行任务发布会", "电力抢修人员在废品站卖电线？假", "特朗普发言后美股盘后上涨", "听障女生因太美被质疑 本人承认微调", "丁俊晖时隔五年再进世锦赛16强", "重庆荣昌五一景点公交停车场全免费", "美股收盘：三大股指均抹去昨日跌幅", "湖北49岁女子被雷电击中身亡", "高校回应聋哑女生因长相完美被质疑", "女演员闻宝宝脚丫致眼睛感染睁不开", "朱婷袁心玥同天夺冠", "特斯拉收入锐减 马斯克减少政府工作", "黄子佼再被查出藏12名少女性影像", "郭富城谈方媛米兰被抢：买俩新包补偿", "广西大部气象干旱已达特旱", "辅警30余年前被人顶替上学 官方通报", "贪欲膨胀 “内鬼”李刚被决定逮捕", "胡塞武装称美军多次袭击也门", "董明珠：搞小三小四能搞好企业才怪", "特斯拉将重估2025年增长预期", "受贿超8.22亿 李鹏新被判死缓", "女子称丈夫拔牙后离世 当地回应", "被医生错切右膝体育生称未来被打乱", "日本首相供奉靖国神社 中方严正交涉", "沉寂23年的“行李箱藏尸案”告破", "两国总统同晚抵达北京", "赵丽颖云合累计有效播放量TOP1", "新易盛：一季度归母净利润同比增长", "女儿给父亲转53万养老钱被丈夫起诉", "五一假期前机票大跳水", "经济学家：美在财政方面成“纸老虎”", "IMF总裁：在债务重组中发挥积极作用", "美社保局提出第二轮“买断”计划", "斯诺克世锦赛斯佳辉晋级16强", "伊朗否认沙特斡旋伊美谈判", "牛弹琴：美国这件事让全世界大开眼界", "71岁董明珠谈用人标准：拒绝海归派", "姐姐回应柯淳女助理挽柯淳的手", "纽约华人夫妇留下豪宅和两儿子失踪", "今年已有四个“大老虎”被判死缓", "39岁网红与前妻3天内相继离世"]

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
