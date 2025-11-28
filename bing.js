// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.442
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
var default_search_words = ["建设人民城市 致广大而尽精微", "香港火灾已造成94人遇难", "山东威海地震 有人梦中被晃醒", "一起来看冬日里的中式美学", "2人徒步梅里雪山大环线失联超120天", "手机厂商将110标注为“匪警”引质疑", "睡觉时猛然一抖是身体在求救吗", "王毅：日本现职领导人公然开历史倒车", "四川官宣：婚假由5日延到20日", "国防部回应中国是否正建造核动力航母", "黑板“留言求废瓶”高中生发声", "“珠峰安装电梯”系谣言", "香港消防处：已完成灭火程序", "西安通报多车连撞事故：肇事者被控制", "央视曝光小诊所用医保卡换豆油和面", "日本维新会：或退出执政联盟", "有关福建舰四川舰 国防部都回应了", "日本朝日集团道歉：大批客户信息泄露", "以军射杀两名手无寸铁巴勒斯坦人", "售货阿姨与主播互动被停职后复工", "美军轰炸机在加勒比海进行攻击演习", "安徽亳州通报一乡镇突发巨响", "国防部回应“演习是否意在警告日本”", "为套取医保30公里外拉老人“看病”", "北京发布太空数据中心建设规划方案", "北溪爆炸案嫌疑人被引渡至德国受审", "白宫枪击案凶手身份曝光", "黄渤海部分海域将进行军事活动", "欧洲议会：俄乌和谈必须有欧洲参与", "“紫火”概念战机运用了哪些黑科技", "社会各界捐款捐物帮助香港受灾居民", "33岁大熊猫高高离世 曾旅居美国", "美俄乌诸多核心议题仍存严重分歧", "香港特区政府向每户灾民派发1万港元", "国防部回应日本在台培养媚日人士", "哈梅内伊：美不值得伊朗接近与合作", "首例“医保价”脑机接口手术完成", "中国中车拟分拆子公司至创业板上市", "李家超：香港大埔火灾已全部受控", "普京称俄军已控制红军城70%的地区", "枪击过后 美国暂停阿富汗移民申请", "欧盟猛烈抨击美国称其使用勒索手段", "普京：美方代表团下周到访莫斯科", "贵州榕江群众为香港火灾受灾者募捐", "国防部：日方招事惹事必付出惨痛代价", "以称摧毁黎南部多地真主党基础设施", "俄方发出明确信号：关键问题上不退让", "男篮vs韩国大名单公布 队长赵睿缺席", "4万元现金被大风刮飞 众人合力找回", "特朗普：将对委内瑞拉展开地面行动", "以再袭约旦河西岸 巴谴责以吞并企图"]

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
