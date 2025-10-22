// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.369
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
var default_search_words = ["中国式现代化民生为大", "东北现真人版“鸳鸯锅” 商家回应", "今年冬天会更冷吗？国家气候中心回应", "综合国力跃上新台阶", "今年的猪肉为何这么便宜", "女子捐200斤旧衣后收到14岁女孩来信", "中国的王牌不只稀土", "大雨暴雨大雪暴雪 即将上线", "92号汽油或重返6元时代", "三个维度看三季度中国经济", "房东收房发现蓝色瓶子为何惊动警方", "网民摆拍涉三秋生产视频被通报", "一夜之间亏20亿？李佳琦回应", "羽绒服里穿薄点才暖和", "根除幽门螺杆菌 中国科学家有新方案", "鸿蒙6正式发布 90余款机型开放升级", "300元以下真的买不到真羽绒服吗", "教育局：成都试点取消中考系误读", "秦始皇帝陵又有新发现", "文玩玉米需求暴涨 价格炒到上万元", "京东新车拍卖最高出价已超4200万", "郭富城方媛三胎出生", "网友：铁盒清凉油是“最犟种产品”", "名创优品80%门店将关闭重开", "印度总统直升机降落时停机坪塌陷", "中方回应特朗普称中美将达成协议", "黄金创12年来最大单日跌幅 金饰热卖", "女子不慎撞到羊被牧民邀请吃羊肉", "长1.4米重70斤 这条草鱼55岁了", "中国女子被指盗走法博物馆6公斤黄金", "外交部回应朝鲜发射多枚弹道导弹", "演员史元庭回应景区打工", "特朗普向特朗普政府索赔2.3亿美元", "你是如何被诈骗团伙盯上的", "佩通坦为何此时“辞职”", "南宁一“巨无霸”摆摊餐车上路被罚", "学生满口“包的包的”网络梗 如何教", "印收费站员工嫌奖金低放车免费通行", "网购二手相机却收到1公斤银条", "国台办：台积电逐步沦为“美积电”", "全球最快高铁坐着是啥感觉", "希拉里痛批特朗普2.5亿美元改造白宫", "专家提醒：大降温这类人别“硬抗”", "鸡排哥将去南京 全国巡炸第一站", "王自如被限消案仍有2878万未履行", "美军火商财报飘红 白宫人设崩塌", "朱立伦11月1日正式交接郑丽文", "奔驰正实施其有史以来最大规模裁员", "学生画作被误认陈丹青作品 买家回应", "双11原想“买买买” 结果“退退退”", "被问涉移民言论 默茨：问你们女儿去"]

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
